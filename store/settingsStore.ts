import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { SettingsState } from '@/types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedProvider: 'anthropic',
      anthropicApiKey: '',
      geminiApiKey: '',
      openaiApiKey: '',
      setSelectedProvider: (p) => set({ selectedProvider: p }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (state: any) => ({
        anthropicApiKey: state?.anthropicApiKey ?? '',
        geminiApiKey: state?.geminiApiKey ?? '',
        openaiApiKey: state?.openaiApiKey ?? '',
        selectedProvider: state?.selectedProvider ?? 'anthropic',
      }),
    }
  )
);
