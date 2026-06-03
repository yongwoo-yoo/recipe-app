import { create } from 'zustand';
import type { UIState, CategoryId } from '@/types';
import type { CategoryGroup } from '@/constants/categories';

interface UIStateExtended extends UIState {
  activeGroup: CategoryGroup;
  setActiveGroup: (group: CategoryGroup) => void;
}

export const useUIStore = create<UIStateExtended>()((set) => ({
  activeGroup: 'all',
  activeCategoryId: 'all',
  searchQuery: '',
  setActiveGroup: (group: CategoryGroup) =>
    set({ activeGroup: group, activeCategoryId: 'all' }),
  setActiveCategory: (id: CategoryId | 'all') => set({ activeCategoryId: id }),
  setSearchQuery: (q: string) => set({ searchQuery: q }),
}));
