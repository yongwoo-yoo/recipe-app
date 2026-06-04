import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, TextInput as RNTextInput, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { appleColors } from '@/constants/theme';
import { formatTime } from '@/utils/formatTime';
import type { Recipe } from '@/types';

interface Props {
  recipe: Recipe;
}

export function FloatingTimer({ recipe }: Props) {
  const stepTotal = recipe.steps
    .filter((s) => s.timer?.durationSeconds)
    .reduce((sum, s) => sum + (s.timer?.durationSeconds ?? 0), 0);

  const [expanded, setExpanded] = useState(false);
  const [duration, setDuration] = useState(stepTotal);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [customMin, setCustomMin] = useState('');
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      interval.current = setInterval(() => {
        setRemaining((p) => {
          if (p <= 1) { setIsRunning(false); return 0; }
          return p - 1;
        });
      }, 1000);
    } else {
      if (interval.current) clearInterval(interval.current);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [isRunning]);

  const start = (sec: number) => {
    setDuration(sec);
    setRemaining(sec);
    setIsRunning(true);
    setIsStarted(true);
  };

  const reset = () => {
    setIsRunning(false);
    setIsStarted(false);
    setRemaining(0);
  };

  const isFinished = isStarted && remaining === 0;
  const progress = duration > 0 ? remaining / duration : 0;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* 확장 패널 */}
      {expanded && (
        <View style={styles.panel}>
          {isStarted ? (
            <>
              <Text style={[styles.bigTime, isFinished && { color: appleColors.red }]}>
                {isFinished ? '완료!' : formatTime(remaining)}
              </Text>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${progress * 100}%` as any }]} />
              </View>
              <View style={styles.controls}>
                <Pressable onPress={reset} style={styles.ctrl} hitSlop={8}>
                  <Text style={styles.ctrlTxt}>↺</Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsRunning(!isRunning)}
                  style={[styles.ctrl, styles.ctrlMain]}
                >
                  <Text style={styles.ctrlMainTxt}>{isRunning ? '⏸' : '▶'}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.presets}>
              {stepTotal > 0 && (
                <Pressable style={styles.presetBtn} onPress={() => start(stepTotal)}>
                  <Text style={styles.presetSub}>합계</Text>
                  <Text style={styles.presetVal}>{formatTime(stepTotal)}</Text>
                </Pressable>
              )}
              {[10, 15, 20, 30].map((m) => (
                <Pressable key={m} style={styles.presetBtn} onPress={() => start(m * 60)}>
                  <Text style={styles.presetVal}>{m}분</Text>
                </Pressable>
              ))}
              <View style={styles.customRow}>
                <RNTextInput
                  value={customMin}
                  onChangeText={setCustomMin}
                  placeholder="분 직접입력"
                  keyboardType="number-pad"
                  style={styles.customInput}
                  placeholderTextColor={appleColors.gray4}
                  onSubmitEditing={() => {
                    const m = parseInt(customMin, 10);
                    if (!isNaN(m) && m > 0) { start(m * 60); setCustomMin(''); }
                  }}
                />
                <Pressable
                  style={styles.customStart}
                  onPress={() => {
                    const m = parseInt(customMin, 10);
                    if (!isNaN(m) && m > 0) { start(m * 60); setCustomMin(''); }
                  }}
                >
                  <Text style={styles.customStartTxt}>▶</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}

      {/* FAB 버튼 */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }, isRunning && styles.fabRunning]}
        onPress={() => setExpanded((v) => !v)}
      >
        <Text style={styles.fabTxt}>
          {isRunning ? formatTime(remaining) : isFinished ? '✓' : '⏱'}
        </Text>
        {isRunning && (
          <View style={[styles.fabArc, { width: `${progress * 100}%` as any }]} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    zIndex: 200,
    alignItems: 'flex-start',
    gap: 10,
  },

  // 확장 패널
  panel: {
    backgroundColor: appleColors.white,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: appleColors.gray5,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 24px rgba(0,0,0,0.14)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 10 }),
  },
  bigTime: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    color: appleColors.gray1,
    textAlign: 'center',
    fontVariant: ['tabular-nums'] as any,
  },
  bar: {
    height: 5, backgroundColor: appleColors.gray5,
    borderRadius: 3, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: appleColors.accent, borderRadius: 3 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  ctrl: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: appleColors.gray5,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlTxt: { fontSize: 18, color: appleColors.gray2 },
  ctrlMain: { width: 48, height: 48, borderRadius: 24, backgroundColor: appleColors.gray1 },
  ctrlMainTxt: { fontSize: 18, color: '#fff' },

  // 프리셋
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: {
    borderRadius: 10, borderWidth: 1.5, borderColor: appleColors.gray4,
    paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center',
  },
  presetSub: { fontSize: 9, color: appleColors.gray3 },
  presetVal: { fontSize: 13, fontWeight: '700', color: appleColors.gray1 },
  customRow: { flexDirection: 'row', gap: 6, width: '100%' },
  customInput: {
    flex: 1, height: 36, borderRadius: 8, borderWidth: 1.5,
    borderColor: appleColors.gray4, paddingHorizontal: 10,
    fontSize: 13, color: appleColors.gray1,
  },
  customStart: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: appleColors.gray1, alignItems: 'center', justifyContent: 'center',
  },
  customStartTxt: { fontSize: 14, color: '#fff' },

  // FAB
  fab: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: appleColors.gray1,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 16px rgba(0,0,0,0.2)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 }),
  },
  fabRunning: { backgroundColor: appleColors.accent },
  fabTxt: { fontSize: 14, fontWeight: '700', color: '#fff', zIndex: 1 },
  fabArc: {
    position: 'absolute', bottom: 0, left: 0,
    height: 4, backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
