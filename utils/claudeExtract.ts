import Anthropic from '@anthropic-ai/sdk';
import type { RecipeFormData, CategoryId } from '@/types';

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract recipe information from the provided content.
Return ONLY valid JSON (no markdown, no explanation) matching this exact structure:
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
- If a step mentions a time duration (e.g. "brew for 3 minutes"), include timer with durationSeconds
- For steps without time, set timer to null
- Use Korean for labels when the content is in Korean
- categoryId must be one of the exact values listed above
- If the content is a coffee recipe, use espresso, hand-drip, or cold-brew as appropriate`;

export async function extractRecipeWithClaude(
  apiKey: string,
  content: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<RecipeFormData> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const userContent: Anthropic.MessageParam['content'] = [];

  if (imageBase64 && imageMimeType) {
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: imageBase64,
      },
    });
  }

  userContent.push({
    type: 'text',
    text: content || '위 이미지에서 레시피를 추출해주세요.',
  });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = message.content.find((b) => b.type === 'text')?.text ?? '';

  let parsed: RecipeFormData;
  try {
    parsed = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI가 올바른 형식의 레시피를 반환하지 않았습니다.');
    parsed = JSON.parse(jsonMatch[0]);
  }

  const validCategories: CategoryId[] = [
    'korean', 'western', 'japanese', 'chinese', 'dessert',
    'espresso', 'hand-drip', 'cold-brew', 'other',
  ];
  if (!validCategories.includes(parsed.categoryId)) {
    parsed.categoryId = 'other';
  }

  // Normalize steps — remove null timers, add UUIDs handled by caller
  parsed.steps = (parsed.steps ?? []).map((s) => ({
    ...s,
    timer: s.timer?.durationSeconds ? s.timer : undefined,
  }));

  return parsed;
}
