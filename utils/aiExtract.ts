import type { RecipeFormData, CategoryId, AIProvider } from '@/types';

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract recipe information from the provided content.
The content may be a YouTube video transcript (subtitle text) — extract ONLY what is actually mentioned in the transcript, do NOT invent ingredients or steps.
Return ONLY valid JSON (no markdown fences, no explanation) matching this exact structure:
{
  "title": "string",
  "categoryId": "korean"|"western"|"japanese"|"chinese"|"dessert"|"espresso"|"hand-drip"|"cold-brew"|"other",
  "brewingTool": "string or null",
  "description": "string",
  "servings": "string",
  "ingredients": [{ "name": "string", "quantity": "string" }],
  "steps": [{ "instruction": "string", "timer": { "durationSeconds": number, "label": "string" } | null }],
  "notes": "string"
}
Rules:
- Extract FAITHFULLY from the source — if the transcript says "된장 한 큰술" use exactly that
- For YouTube transcripts: ignore intro/outro chatter, focus on cooking actions and ingredient mentions
- If quantity is not mentioned, use empty string ""
- If a step mentions a time duration (e.g. "3분", "3 minutes"), include timer with durationSeconds
- For steps without time, set timer to null
- Use Korean for all text output
- categoryId must be exactly one of the listed values
- Coffee recipes: use espresso for espresso-based; hand-drip for pour-over/drip; cold-brew for cold brew
- brewingTool: if categoryId is "hand-drip", set the tool (e.g. "V60", "케멕스", "칼리타", "에어로프레스", "사이폰", "프렌치프레스") or null. Other categories: null.`;

function parseResult(text: string): RecipeFormData {
  let parsed: RecipeFormData;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI가 올바른 형식의 레시피를 반환하지 않았습니다.');
    parsed = JSON.parse(match[0]);
  }
  const valid: CategoryId[] = [
    'korean', 'western', 'japanese', 'chinese', 'dessert',
    'espresso', 'hand-drip', 'cold-brew', 'other',
  ];
  if (!valid.includes(parsed.categoryId)) parsed.categoryId = 'other';
  parsed.steps = (parsed.steps ?? []).map((s) => ({
    ...s,
    timer: s.timer?.durationSeconds ? s.timer : undefined,
  }));
  if (parsed.brewingTool === null) parsed.brewingTool = undefined;
  return parsed;
}

// ── Anthropic (REST) ─────────────────────────────────────────
async function extractWithAnthropic(
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  const userContent: any[] = [];
  if (imageBase64 && imageMimeType) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: imageMimeType, data: imageBase64 },
    });
  }
  userContent.push({ type: 'text', text: content || '위 이미지에서 레시피를 추출해주세요.' });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API 오류 (${res.status}): ${err}`);
  }
  const json = await res.json();
  const text: string = json.content?.[0]?.text ?? '';
  if (!text) throw new Error('Claude가 응답을 반환하지 않았습니다.');
  return parseResult(text);
}

// ── Gemini (REST) ────────────────────────────────────────────
async function extractWithGemini(
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  const MODEL = 'gemini-3.1-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const parts: any[] = [];
  if (imageBase64 && imageMimeType) {
    parts.push({ inline_data: { mime_type: imageMimeType, data: imageBase64 } });
  }
  parts.push({ text: SYSTEM_PROMPT + '\n\n' + (content || '이미지에서 레시피를 추출해주세요.') });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 오류 (${res.status}): ${err}`);
  }
  const json = await res.json();
  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Gemini가 응답을 반환하지 않았습니다.');
  return parseResult(text);
}

// ── OpenAI (REST) ────────────────────────────────────────────
async function extractWithOpenAI(
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  const userParts: any[] = [];
  if (imageBase64 && imageMimeType) {
    userParts.push({
      type: 'image_url',
      image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
    });
  }
  userParts.push({ type: 'text', text: content || '위 이미지에서 레시피를 추출해주세요.' });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userParts },
      ],
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API 오류 (${res.status}): ${err}`);
  }
  const json = await res.json();
  const text: string = json.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('ChatGPT가 응답을 반환하지 않았습니다.');
  return parseResult(text);
}

// ── Unified entry point ───────────────────────────────────────
export async function extractRecipe(
  provider: AIProvider,
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  if (provider === 'gemini') return extractWithGemini(apiKey, content, imageBase64, imageMimeType);
  if (provider === 'openai') return extractWithOpenAI(apiKey, content, imageBase64, imageMimeType);
  return extractWithAnthropic(apiKey, content, imageBase64, imageMimeType);
}
