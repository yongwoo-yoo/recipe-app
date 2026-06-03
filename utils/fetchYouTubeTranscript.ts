import { extractYouTubeId } from './extractYouTubeId';

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '') // HTML 태그 제거
    .replace(/\n/g, ' ');
}

// ── STEP 1: 페이지에서 InnerTube API 키 추출 ─────────────────
async function getInnerTubeApiKey(videoId: string): Promise<string> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8' },
  });
  const html = await res.text();
  const match = html.match(/"INNERTUBE_API_KEY"\s*:\s*"([a-zA-Z0-9_-]+)"/);
  if (!match) throw new Error('InnerTube API 키를 찾을 수 없습니다.');
  return match[1];
}

// ── STEP 2: InnerTube player API로 자막 트랙 목록 획득 ────────
// youtube-transcript-api와 동일: ANDROID 클라이언트 사용
async function getCaptionTracks(videoId: string, apiKey: string): Promise<{
  captionTracks: Array<{ baseUrl: string; languageCode: string; kind?: string; name?: string }>;
}> {
  const res = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'ANDROID',
            clientVersion: '20.10.38',
            hl: 'ko',
            gl: 'KR',
          },
        },
        videoId,
      }),
    }
  );

  if (res.status === 429) throw new Error('YouTube 요청 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.');
  if (!res.ok) throw new Error(`YouTube API 오류: ${res.status}`);

  const data = await res.json();

  // 에러 상태 확인
  const status = data?.playabilityStatus?.status;
  if (status && status !== 'OK') {
    const reason = data?.playabilityStatus?.reason ?? '';
    if (reason.includes('bot')) throw new Error('YouTube가 봇으로 감지했습니다.');
    if (reason.includes('inappropriate') || reason.includes('age')) throw new Error('연령 제한 영상입니다.');
    if (status === 'ERROR') throw new Error('영상을 찾을 수 없습니다.');
  }

  const captions = data?.captions?.playerCaptionsTracklistRenderer;
  const captionTracks = (captions?.captionTracks ?? []).map((t: any) => ({
    baseUrl: t.baseUrl,
    languageCode: t.languageCode,
    kind: t.kind,
    name: t.name?.runs?.[0]?.text ?? t.languageCode,
  }));

  return { captionTracks };
}

// ── STEP 3: 자막 다운로드 및 파싱 ───────────────────────────
// ANDROID 클라이언트 URL은 fmt=srv3 → json3으로 교체해서 요청
async function downloadTranscript(baseUrl: string): Promise<string> {
  const url = baseUrl.replace('fmt=srv3', 'fmt=json3');
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ko-KR,ko;q=0.9' },
  });
  if (!res.ok) throw new Error(`자막 다운로드 실패: ${res.status}`);

  const data = await res.json();
  const events: any[] = data.events ?? [];
  const lines: string[] = [];

  for (const e of events) {
    if (!e.segs) continue;
    const text = e.segs
      .map((s: any) => decodeHtml((s.utf8 || '').replace(/\n/g, ' ')))
      .join('')
      .trim();
    if (!text) continue;
    const ts = formatTime((e.tStartMs ?? 0) / 1000);
    lines.push(`${ts} ${text}`);
  }

  return lines.join('\n');
}

// ── 언어 우선순위 선택 ────────────────────────────────────────
function pickBestTrack(tracks: Array<{ baseUrl: string; languageCode: string; kind?: string }>) {
  const order = [
    (t: any) => t.languageCode === 'ko' && t.kind !== 'asr',  // 한국어 수동
    (t: any) => t.languageCode === 'ko',                        // 한국어 (자동생성 포함)
    (t: any) => t.languageCode?.startsWith('ko'),
    (t: any) => t.languageCode === 'en' && t.kind !== 'asr',  // 영어 수동
    (t: any) => t.languageCode === 'en',
    () => true,
  ];
  for (const fn of order) {
    const t = tracks.find(fn);
    if (t) return t;
  }
  return null;
}

// ── oEmbed 제목/채널 ─────────────────────────────────────────
async function fetchOEmbed(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return '';
    const d = await res.json();
    return `제목: ${d.title}\n채널: ${d.author_name}`;
  } catch { return ''; }
}

// ── 메인 진입점 ──────────────────────────────────────────────
export async function fetchYouTubeContent(youtubeUrl: string): Promise<string> {
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) throw new Error('유효하지 않은 YouTube URL입니다.');

  // STEP 1: API 키
  const apiKey = await getInnerTubeApiKey(videoId);

  // STEP 2: 자막 트랙 목록
  const { captionTracks } = await getCaptionTracks(videoId, apiKey);

  if (!captionTracks.length) {
    throw new Error(
      '자막이 없는 영상입니다.\nYouTube에서 스크립트를 직접 복사해서 "텍스트" 탭에 붙여넣어 주세요.'
    );
  }

  // STEP 3: 최적 트랙 선택 & 다운로드
  const track = pickBestTrack(captionTracks);
  if (!track) throw new Error('적합한 자막을 찾을 수 없습니다.');

  const transcript = await downloadTranscript(track.baseUrl);

  if (!transcript) {
    throw new Error(
      '자막 내용을 가져올 수 없습니다.\n직접 복사해서 "텍스트" 탭에 붙여넣어 주세요.'
    );
  }

  const oembed = await fetchOEmbed(videoId);
  return [oembed, '\n[자막]\n' + transcript].filter(Boolean).join('\n');
}
