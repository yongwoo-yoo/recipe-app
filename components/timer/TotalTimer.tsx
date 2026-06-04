import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { appleColors } from '@/constants/theme';
import { formatTime } from '@/utils/formatTime';
import type { Recipe } from '@/types';

interface Props {
  recipe: Recipe;
}

export function TotalTimer({ recipe }: Props) {
  // 설정값 (초)
  const [configured, setConfigured] = useState(0);
  // 실행 상태
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
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

  const add = (sec: number) => setConfigured((v) => Math.max(0, v + sec));

  const handleStart = () => {
    if (configured <= 0) return;
    setRemaining(configured);
    setIsRunning(true);
    setIsStarted(true);
    setPanelOpen(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsStarted(false);
    setRemaining(0);
    setConfigured(0);
    setPanelOpen(true);
  };

  const isFinished = isStarted && remaining === 0;
  const progress = configured > 0 ? remaining / configured : 0;

  // ── 플로팅 (실행 중) ─────────────────────────────────────────
  const FloatingBadge = () => (
    <Modal transparent animationType="fade" visible={isStarted} onRequestClose={() => setPanelOpen(false)}>
      <View style={float.root} pointerEvents="box-none">
        {panelOpen && (
          <View style={float.panel}>
            <Text style={[float.bigTime, isFinished && { color: appleColors.red }]}>
              {isFinished ? '완료!' : formatTime(remaining)}
            </Text>
            <View style={float.bar}>
              <View style={[float.fill, { width: `${progress * 100}%` as any }]} />
            </View>
            <View style={float.btns}>
              <Pressable onPress={handleReset} style={float.ctrl} hitSlop={8}>
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
          onPress={() => setPanelOpen((v) => !v)}
        >
          <Text style={float.fabTxt}>{isFinished ? '✓' : formatTime(remaining)}</Text>
        </Pressable>
      </View>
    </Modal>
  );

  // ── 설정 섹션 ─────────────────────────────────────────────────
  return (
    <>
      <FloatingBadge />
      <View style={styles.container}>
        <Text style={styles.label}>⏱ 전체 타이머</Text>

        {/* 현재 설정된 시간 */}
        <View style={styles.displayRow}>
          <Text style={[styles.display, configured === 0 && { color: appleColors.gray4 }]}>
            {configured === 0 ? '0:00' : formatTime(configured)}
          </Text>
          {configured > 0 && (
            <Pressable onPress={() => setConfigured(0)} style={styles.clearBtn} hitSlop={8}>
              <Text style={styles.clearTxt}>초기화</Text>
            </Pressable>
          )}
        </View>

        {/* 증감 버튼 */}
        <View style={styles.adjustRow}>
          {[
            { label: '분', delta: 60 },
            { label: '10초', delta: 10 },
            { label: '1초', delta: 1 },
          ].map(({ label, delta }) => (
            <View key={label} style={styles.adjGroup}>
              <Text style={styles.adjLabel}>{label}</Text>
              <View style={styles.adjBtnRow}>
                <Pressable style={styles.adjBtn} onPress={() => add(-delta)} hitSlop={8}>
                  <Text style={styles.adjMinus}>−</Text>
                </Pressable>
                <Pressable style={[styles.adjBtn, styles.adjBtnPlus]} onPress={() => add(delta)} hitSlop={8}>
                  <Text style={styles.adjPlus}>+</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* 시작 버튼 */}
        <Pressable
          style={[styles.startBtn, configured <= 0 && { opacity: 0.35 }]}
          disabled={configured <= 0}
          onPress={handleStart}
        >
          <Text style={styles.startTxt}>▶  시작</Text>
        </Pressable>
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
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: appleColors.gray5,
  },
  label: { fontSize: 13, fontWeight: '700', color: appleColors.gray2, letterSpacing: 0.2 },

  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  display: {
    fontSize: 36,
    fontWeight: '800',
    color: appleColors.gray1,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'] as any,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: appleColors.gray5,
  },
  clearTxt: { fontSize: 12, fontWeight: '600', color: appleColors.gray2 },

  adjustRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  adjLabel: {
    fontSize: 12, fontWeight: '700',
    color: appleColors.gray2,
  },
  adjBtnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  adjBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: appleColors.gray5,
  },
  adjBtnPlus: {
    backgroundColor: appleColors.gray1,
  },
  adjMinus: { fontSize: 20, fontWeight: '500', color: appleColors.gray1, lineHeight: 22 },
  adjPlus: { fontSize: 20, fontWeight: '500', color: '#fff', lineHeight: 22 },

  startBtn: {
    backgroundColor: appleColors.gray1,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTxt: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
});

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
