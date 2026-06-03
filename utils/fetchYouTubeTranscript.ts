import { extractYouTubeId } from './extractYouTubeId';

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

const YT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  // YouTube 동의 쿠키 — 지역 차단 우회
  'Cookie': 'CONSENT=YES+42; SOCS=CAI;',
};

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n/g, ' ');
}

function parseCaptionTracks(html: string): CaptionTrack[] {
  const idx = html.indexOf('"captionTracks"');
  if (idx === -1) return [];
  const start = html.indexOf('[', idx);
  if (start === -1) return [];
  let depth = 0, end = start;
  for (let i = start; i < html.length; i++) {
    if (html[i] === '[' || html[i] === '{') depth++;
    else if (html[i] === ']' || html[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  try {
    return JSON.parse(html.slice(start, end + 1).replace(/\\u0026/g, '&'));
  } catch { return []; }
}

function pickTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  const order = [
    (t: CaptionTrack) => t.languageCode === 'ko' && t.kind !== 'asr',
    (t: CaptionTrack) => t.languageCode === 'ko',
    (t: CaptionTrack) => t.languageCode?.startsWith('ko'),
    (t: CaptionTrack) => t.languageCode === 'en' && t.kind !== 'asr',
    (t: CaptionTrack) => t.languageCode === 'en',
    () => true,
  ];
  for (const fn of order) {
    const t = tracks.find(fn);
    if (t) return t;
  }
  return null;
}

async function transcriptFromTrack(track: CaptionTrack): Promise<string> {
  let url = track.baseUrl;
  if (!url.startsWith('http')) url = 'https://www.youtube.com' + url;

  // JSON3 형식 요청
  const jsonUrl = url + (url.includes('?') ? '&' : '?') + 'fmt=json3';
  const res = await fetch(jsonUrl, { headers: YT_HEADERS });

  if (res.ok) {
    const text = await res.text();
    if (text.trim().startsWith('{')) {
      const data = JSON.parse(text);
      const segs = (data.events ?? [])
        .flatMap((e: any) => e.segs ?? [])
        .map((s: any) => decodeEntities((s.utf8 || '').replace(/\n/g, ' ')))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (segs) return segs;
    }
  }

  // XML 폴백
  const xmlRes = await fetch(url, { headers: YT_HEADERS });
  const xml = await xmlRes.text();
  const texts = xml.match(/<text[^>]*>([^<]*)<\/text>/g) ?? [];
  return texts
    .map(t => decodeEntities(t.replace(/<[^>]+>/g, '')))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPageTranscript(videoId: string): Promise<{ title: string; transcript: string }> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers: YT_HEADERS });
  if (!res.ok) throw new Error('YouTube 페이지를 불러올 수 없습니다.');
  const html = await res.text();

  // 제목
  const titleMatch = html.match(/"title":"([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/\s*[-|–]\s*YouTube\s*$/, '').trim() : '';

  const tracks = parseCaptionTracks(html);
  if (!tracks.length) return { title, transcript: '' };

  const track = pickTrack(tracks);
  if (!track) return { title, transcript: '' };

  const transcript = await transcriptFromTrack(track);
  return { title, transcript };
}

export async function fetchYouTubeContent(youtubeUrl: string): Promise<string> {
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) throw new Error('유효하지 않은 YouTube URL입니다.');

  const { title, transcript } = await fetchPageTranscript(videoId);

  if (!transcript) {
    const msg = title
      ? `"${title}" 영상에서 자막을 가져올 수 없습니다.\n자막(CC)이 켜져 있는 영상인지 확인해주세요.`
      : '자막을 가져올 수 없습니다. 자막(CC)이 있는 영상을 사용해주세요.';
    throw new Error(msg);
  }

  const langNote = transcript.length > 100 ? '' : '';
  return [
    title ? `제목: ${title}` : '',
    '',
    '[자막 전문]',
    transcript,
  ].filter((l, i) => i !== 1 || title).join('\n');
}
