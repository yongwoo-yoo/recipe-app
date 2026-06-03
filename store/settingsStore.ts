import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { SettingsState } from '@/types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      anthropicApiKey: '',
      setAnthropicApiKey: (key: string) => set({ anthropicApiKey: key }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
