import { extractYouTubeId } from './extractYouTubeId';

interface TranscriptSegment {
  text: string;
  start: number;
  dur: number;
}

async function fetchTranscriptXml(videoId: string, lang: string): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const events: Array<{ segs?: Array<{ utf8: string }> }> = data.events ?? [];
    const text = events
      .flatMap((e) => e.segs ?? [])
      .map((s) => s.utf8.replace(/\n/g, ' '))
      .join(' ')
      .trim();
    return text || null;
  } catch {
    return null;
  }
}

async function fetchVideoDescription(videoId: string): Promise<string> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    return `Title: ${data.title}\nAuthor: ${data.author_name}`;
  } catch {
    return '';
  }
}

export async function fetchYouTubeContent(youtubeUrl: string): Promise<string> {
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) throw new Error('유효하지 않은 YouTube URL입니다.');

  const transcript =
    (await fetchTranscriptXml(videoId, 'ko')) ??
    (await fetchTranscriptXml(videoId, 'en')) ??
    null;

  const description = await fetchVideoDescription(videoId);

  if (!transcript && !description) {
    throw new Error('영상에서 자막이나 설명을 가져올 수 없습니다.');
  }

  return [
    description,
    transcript ? `\n\n[자막]\n${transcript}` : '\n\n[자막 없음 — 제목/설명으로만 추출]',
  ]
    .filter(Boolean)
    .join('');
}
