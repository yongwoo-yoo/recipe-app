import { create } from 'zustand';
import type { TimerState } from '@/types';

export const useTimerStore = create<TimerState>()((set) => ({
  activeStepId: null,
  recipeId: null,
  remainingSeconds: 0,
  totalSeconds: 0,
  isRunning: false,

  startTimer: (stepId, recipeId, durationSeconds) =>
    set({
      activeStepId: stepId,
      recipeId,
      remainingSeconds: durationSeconds,
      totalSeconds: durationSeconds,
      isRunning: true,
    }),

  pauseTimer: () => set({ isRunning: false }),

  resumeTimer: () => set({ isRunning: true }),

  resetTimer: () =>
    set((s) => ({ remainingSeconds: s.totalSeconds, isRunning: false })),

  tickTimer: () =>
    set((s) => {
      const next = Math.max(0, s.remainingSeconds - 1);
      return { remainingSeconds: next, isRunning: next > 0 };
    }),
}));
