import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useTimerStore } from '@/store/timerStore';

export function useTimer() {
  const isRunning = useTimerStore((s) => s.isRunning);
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const tickTimer = useTimerStore((s) => s.tickTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(tickTimer, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, remainingSeconds, tickTimer]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const { isRunning: running, remainingSeconds: rem } = useTimerStore.getState();
      if (nextState === 'background' && running) {
        backgroundTimeRef.current = Date.now();
      } else if (nextState === 'active' && backgroundTimeRef.current && running) {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        const ticks = Math.min(elapsed, rem);
        for (let i = 0; i < ticks; i++) {
          useTimerStore.getState().tickTimer();
        }
        backgroundTimeRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);
}
