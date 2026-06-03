import type { Category, CategoryId } from '@/types';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  카테고리 색상 — Warm Paper 리뉴얼에 맞춰 살짝 조정한 값입니다.
 *  constants/categories.ts 의 CATEGORIES 배열에서 color 값만 아래로
 *  교체하면 됩니다. id / label / emoji 는 그대로 두세요.
 *
 *  변경 의도: 원래 색조를 유지하되 채도를 약간 낮춰 따뜻한 페이퍼
 *  배경 위에서 차분하게 어울리도록 했습니다.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const CATEGORY_COLORS: Record<CategoryId, string> = {
  korean:      '#E2574C', //  #FF6B6B → 톤 다운
  western:     '#2BB6A8', //  #4ECDC4
  japanese:    '#E0A02E', //  #F7B731
  chinese:     '#D9683F', //  #e17055
  dessert:     '#8B7CE8', //  #A29BFE
  espresso:    '#6C5CE7', //  유지
  'hand-drip': '#10A37F', //  #00B894
  'cold-brew': '#4F9DF0', //  #74B9FF
  other:       '#9B9488', //  #B2BEC3 (warm gray)
};

// 참고용 — 교체 후 CATEGORIES 전체 모습
export const CATEGORIES: Category[] = [
  { id: 'korean',    label: '한식',       emoji: '🍚', color: '#E2574C' },
  { id: 'western',   label: '양식',       emoji: '🍝', color: '#2BB6A8' },
  { id: 'japanese',  label: '일식',       emoji: '🍱', color: '#E0A02E' },
  { id: 'chinese',   label: '중식',       emoji: '🥟', color: '#D9683F' },
  { id: 'dessert',   label: '디저트',     emoji: '🍰', color: '#8B7CE8' },
  { id: 'espresso',  label: '에스프레소', emoji: '☕', color: '#6C5CE7' },
  { id: 'hand-drip', label: '핸드드립',   emoji: '🫖', color: '#10A37F' },
  { id: 'cold-brew', label: '콜드브루',   emoji: '🧊', color: '#4F9DF0' },
  { id: 'other',     label: '기타',       emoji: '🍽️', color: '#9B9488' },
];
