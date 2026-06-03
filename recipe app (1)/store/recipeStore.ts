import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { Recipe, RecipeState } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      isLoaded: false,

      addRecipe: (data) => {
        const now = new Date().toISOString();
        const recipe: Recipe = { ...data, id: generateId(), createdAt: now, updatedAt: now };
        set((state) => ({ recipes: [...state.recipes, recipe] }));
      },

      updateRecipe: (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      deleteRecipe: (id) => {
        set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }));
      },

      getRecipeById: (id) => get().recipes.find((r) => r.id === id),
    }),
    {
      name: STORAGE_KEYS.RECIPES,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    }
  )
);
