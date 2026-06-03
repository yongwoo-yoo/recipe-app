import type { RecipeFormData, CategoryId, AIProvider } from '@/types';

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract recipe information from the provided content.
Return ONLY valid JSON (no markdown fences, no explanation) matching this exact structure:
{
  "title": "string",
  "categoryId": "korean"|"western"|"japanese"|"chinese"|"dessert"|"espresso"|"hand-drip"|"cold-brew"|"other",
  "description": "string",
  "servings": "string",
  "ingredients": [{ "name": "string", "quantity": "string" }],
  "steps": [{ "instruction": "string", "timer": { "durationSeconds": number, "label": "string" } | null }],
  "notes": "string"
}
Rules:
- If a step mentions a time duration (e.g. "3 minutes"), include timer with durationSeconds
- For steps without time, set timer to null
- Use Korean for all text output
- categoryId must be exactly one of the listed values
- Coffee recipes: use espresso, hand-drip, or cold-brew as appropriate`;

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

  return parsed;
}

// ── Anthropic ────────────────────────────────────────────────
async function extractWithAnthropic(
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const userContent: any[] = [];
  if (imageBase64 && imageMimeType) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: imageMimeType, data: imageBase64 },
    });
  }
  userContent.push({ type: 'text', text: content || '위 이미지에서 레시피를 추출해주세요.' });

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const block = msg.content.find((b) => b.type === 'text');
  const text = block && block.type === 'text' ? block.text : '';
  return parseResult(text);
}

// ── Gemini ───────────────────────────────────────────────────
async function extractWithGemini(
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const parts: any[] = [{ text: SYSTEM_PROMPT + '\n\n' + (content || '이미지에서 레시피를 추출해주세요.') }];

  if (imageBase64 && imageMimeType) {
    parts.unshift({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
  }

  const result = await model.generateContent(parts);
  const text = result.response.text();
  return parseResult(text);
}

// ── OpenAI ───────────────────────────────────────────────────
async function extractWithOpenAI(
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const userParts: any[] = [];
  if (imageBase64 && imageMimeType) {
    userParts.push({
      type: 'image_url',
      image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
    });
  }
  userParts.push({ type: 'text', text: content || '위 이미지에서 레시피를 추출해주세요.' });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userParts },
    ],
    max_tokens: 2048,
  });

  const text = response.choices[0]?.message?.content ?? '';
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
