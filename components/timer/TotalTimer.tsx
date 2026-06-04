import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, TextInput as RNTextInput, Modal, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { appleColors } from '@/constants/theme';
import { formatTime } from '@/utils/formatTime';
import type { Recipe } from '@/types';

const MAX_SECONDS = 600; // 최대 10분

interface Props {
  recipe: Recipe;
}

export function TotalTimer({ recipe }: Props) {
  const stepTotal = Math.min(
    recipe.steps.filter((s) => s.timer?.durationSeconds).reduce((sum, s) => sum + (s.timer?.durationSeconds ?? 0), 0),
    MAX_SECONDS
  );

  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [expanded, setExpanded] = useState(true);
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
    const capped = Math.min(sec, MAX_SECONDS);
    setDuration(capped);
    setRemaining(capped);
    setIsRunning(true);
    setIsStarted(true);
    setExpanded(false);
  };

  const reset = () => {
    setIsRunning(false);
    setIsStarted(false);
    setRemaining(0);
    setDuration(0);
    setExpanded(true);
  };

  const isFinished = isStarted && remaining === 0;
  const progress = duration > 0 ? remaining / duration : 0;

  // ── 플로팅 (실행 중) ──────────────────────────────────────────
  const FloatingBadge = () => (
    <Modal transparent animationType="fade" visible={isStarted} onRequestClose={() => setExpanded(false)}>
      <View style={float.root} pointerEvents="box-none">
        {expanded && (
          <View style={float.panel}>
            <Text style={[float.bigTime, isFinished && { color: appleColors.red }]}>
              {isFinished ? '완료!' : formatTime(remaining)}
            </Text>
            <View style={float.bar}>
              <View style={[float.fill, { width: `${progress * 100}%` as any }]} />
            </View>
            <View style={float.btns}>
              <Pressable onPress={reset} style={float.ctrl} hitSlop={8}>
                <Text style={float.ctrlTxt}>↺</Text>
              </Pressable>
              <Pressable onPress={() => setIsRunning(!isRunning)} style={[float.ctrl, float.ctrlMain]}>
                <Text style={float.ctrlMainTxt}>{isRunning ? '⏸' : '▶'}</Text>
              </Pressable>
            </View>
          </View>
        )}
        <Pressable
          style={[float.fab, isFinished && { backgroundColor: appleColors.red }, isRunning && { backgroundColor: appleColors.accent }]}
          onPress={() => setExpanded((v) => !v)}
        >
          <Text style={float.fabTxt}>{isFinished ? '✓' : formatTime(remaining)}</Text>
        </Pressable>
      </View>
    </Modal>
  );

  // ── 설정 섹션 (재료 아래 고정) ───────────────────────────────
  return (
    <>
      <FloatingBadge />
      <View style={styles.container}>
        <Text style={styles.label}>⏱ 전체 타이머 <Text style={styles.labelSub}>(최대 10분)</Text></Text>
        <View style={styles.presets}>
          {[3, 5, 7, 10].map((m) => (
            <Pressable key={m} style={styles.presetBtn} onPress={() => start(m * 60)}>
              <Text style={styles.presetVal}>{m}분</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.customRow}>
          <RNTextInput
            value={customMin}
            onChangeText={(v) => {
              const n = parseInt(v, 10);
              if (v === '') setCustomMin('');
              else if (!isNaN(n)) setCustomMin(String(Math.min(n, 10)));
            }}
            placeholder="분 입력 (최대 10)"
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={appleColors.gray4}
            maxLength={2}
          />
          <Pressable
            style={styles.startBtn}
            onPress={() => {
              const m = parseInt(customMin, 10);
              if (!isNaN(m) && m > 0) { start(m * 60); setCustomMin(''); }
            }}
          >
            <Text style={styles.startBtnTxt}>시작</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: appleColors.white,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: appleColors.gray5,
  },
  label: { fontSize: 13, fontWeight: '700', color: appleColors.gray1 },
  labelSub: { fontSize: 11, fontWeight: '400', color: appleColors.gray3 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: {
    borderRadius: 10, borderWidth: 1.5, borderColor: appleColors.gray4,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
  },
  presetSub: { fontSize: 9, color: appleColors.gray3 },
  presetVal: { fontSize: 14, fontWeight: '700', color: appleColors.gray1 },
  customRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, height: 42, borderRadius: 10, borderWidth: 1.5,
    borderColor: appleColors.gray4, paddingHorizontal: 12,
    fontSize: 14, color: appleColors.gray1,
  },
  startBtn: {
    height: 42, paddingHorizontal: 20, borderRadius: 10,
    backgroundColor: appleColors.gray1, alignItems: 'center', justifyContent: 'center',
  },
  startBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

// 플로팅 스타일
const float = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    alignItems: 'flex-start',
    gap: 10,
    zIndex: 9999,
  },
  panel: {
    backgroundColor: appleColors.white,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    minWidth: 180,
    borderWidth: 1,
    borderColor: appleColors.gray5,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 24px rgba(0,0,0,0.15)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 12 }),
  },
  bigTime: { fontSize: 38, fontWeight: '800', letterSpacing: -1, color: appleColors.gray1, textAlign: 'center', fontVariant: ['tabular-nums'] as any },
  bar: { height: 5, backgroundColor: appleColors.gray5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: appleColors.accent, borderRadius: 3 },
  btns: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  ctrl: { width: 40, height: 40, borderRadius: 20, backgroundColor: appleColors.gray5, alignItems: 'center', justifyContent: 'center' },
  ctrlTxt: { fontSize: 18, color: appleColors.gray2 },
  ctrlMain: { width: 48, height: 48, borderRadius: 24, backgroundColor: appleColors.gray1 },
  ctrlMainTxt: { fontSize: 18, color: '#fff' },
  fab: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: appleColors.gray1,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 16px rgba(0,0,0,0.2)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 }),
  },
  fabTxt: { fontSize: 13, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] as any },
});
