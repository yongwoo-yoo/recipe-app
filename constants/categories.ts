import type { Category, CategoryId } from '@/types';

export type CategoryGroup = 'all' | 'cooking' | 'coffee';

export const CATEGORY_GROUPS: { id: CategoryGroup; label: string; emoji: string }[] = [
  { id: 'all',     label: '전체', emoji: '✦' },
  { id: 'cooking', label: '요리', emoji: '🍳' },
  { id: 'coffee',  label: '커피', emoji: '☕' },
];

export const CATEGORY_GROUP_MAP: Record<CategoryId, CategoryGroup> = {
  korean:      'cooking',
  western:     'cooking',
  japanese:    'cooking',
  chinese:     'cooking',
  dessert:     'cooking',
  espresso:    'coffee',
  'hand-drip': 'coffee',
  'cold-brew': 'coffee',
  other:       'all',
};

export const CATEGORIES: Category[] = [
  { id: 'korean',    label: '한식',      emoji: '🍚', color: '#C85A50' },
  { id: 'western',   label: '양식',      emoji: '🍝', color: '#3D9E96' },
  { id: 'japanese',  label: '일식',      emoji: '🍱', color: '#C88A1A' },
  { id: 'chinese',   label: '중식',      emoji: '🥟', color: '#B86040' },
  { id: 'dessert',   label: '디저트',    emoji: '🍰', color: '#7B70C8' },
  { id: 'espresso',  label: '에스프레소', emoji: '☕', color: '#5E52B4' },
  { id: 'hand-drip', label: '핸드드립',  emoji: '🫖', color: '#1A8C6E' },
  { id: 'cold-brew', label: '콜드브루',  emoji: '🧊', color: '#4A8EC4' },
  { id: 'other',     label: '기타',      emoji: '🍽️', color: '#8A8070' },
];

export const getCategoryById = (id: CategoryId | string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const getCategoriesForGroup = (group: CategoryGroup): Category[] => {
  if (group === 'all') return CATEGORIES;
  return CATEGORIES.filter((c) => CATEGORY_GROUP_MAP[c.id] === group || c.id === 'other');
};
