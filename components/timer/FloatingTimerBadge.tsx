import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { appleColors } from '@/constants/theme';
import { formatTime } from '@/utils/formatTime';

interface Props {
  remaining: number;
  duration: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function FloatingTimerBadge({ remaining, duration, isRunning, onToggle, onReset }: Props) {
  const [expanded, setExpanded] = useState(true);
  const isFinished = remaining === 0;
  const progress = duration > 0 ? remaining / duration : 0;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {expanded && (
        <View style={styles.panel}>
          <Text style={[styles.bigTime, isFinished && { color: appleColors.red }]}>
            {isFinished ? '완료!' : formatTime(remaining)}
          </Text>
          <View style={styles.bar}>
            <View style={[styles.fill, {
              width: `${progress * 100}%` as any,
              backgroundColor: isFinished ? appleColors.red : appleColors.accent,
            }]} />
          </View>
          <View style={styles.btns}>
            <Pressable onPress={onReset} style={styles.ctrl} hitSlop={8}>
              <Text style={styles.ctrlTxt}>↺</Text>
            </Pressable>
            <Pressable onPress={onToggle} style={[styles.ctrl, styles.ctrlMain]}>
              <Text style={styles.ctrlMainTxt}>{isRunning ? '⏸' : '▶'}</Text>
            </Pressable>
          </View>
        </View>
      )}
      <Pressable
        style={[styles.fab, isFinished && { backgroundColor: appleColors.red }, isRunning && { backgroundColor: appleColors.accent }]}
        onPress={() => setExpanded((v) => !v)}
      >
        <Text style={styles.fabTxt}>{isFinished ? '✓' : formatTime(remaining)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    alignItems: 'flex-start',
    gap: 10,
    zIndex: 100,
  },
  panel: {
    backgroundColor: appleColors.white,
    borderRadius: 18, padding: 16, gap: 10, minWidth: 180,
    borderWidth: 1, borderColor: appleColors.gray5,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 24px rgba(0,0,0,0.15)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 12 }),
  },
  bigTime: { fontSize: 38, fontWeight: '800', letterSpacing: -1, color: appleColors.gray1, textAlign: 'center', fontVariant: ['tabular-nums'] as any },
  bar: { height: 5, backgroundColor: appleColors.gray5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
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
