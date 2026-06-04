import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useTimerStore } from '@/store/timerStore';
import { appleColors } from '@/constants/theme';
import { formatTime } from '@/utils/formatTime';

export function CountdownTimer() {
  const { remainingSeconds, totalSeconds, isRunning, pauseTimer, resumeTimer, resetTimer } =
    useTimerStore();

  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const isFinished = remainingSeconds === 0 && totalSeconds > 0;

  return (
    <View style={styles.container}>
      {/* 프로그레스 바 */}
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${progress * 100}%` as any, backgroundColor: isFinished ? appleColors.red : appleColors.accent }]} />
      </View>

      {/* 시간 + 컨트롤 */}
      <View style={styles.row}>
        <Text style={[styles.time, isFinished && { color: appleColors.red }]}>
          {isFinished ? '완료!' : formatTime(remainingSeconds)}
        </Text>
        <View style={styles.btns}>
          <Pressable onPress={resetTimer} style={styles.btn} hitSlop={8}>
            <Text style={styles.btnTxt}>↺</Text>
          </Pressable>
          <Pressable onPress={isRunning ? pauseTimer : resumeTimer} style={[styles.btn, styles.btnMain]}>
            <Text style={styles.btnMainTxt}>{isRunning ? '⏸' : '▶'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, gap: 6 },
  bar: { height: 4, backgroundColor: appleColors.gray5, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: {
    fontSize: 22,
    fontWeight: '700',
    color: appleColors.gray1,
    fontVariant: ['tabular-nums'] as any,
    letterSpacing: -0.5,
  },
  btns: { flexDirection: 'row', gap: 8 },
  btn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: appleColors.gray5,
    alignItems: 'center', justifyContent: 'center',
  },
  btnTxt: { fontSize: 15, color: appleColors.gray2 },
  btnMain: { backgroundColor: appleColors.gray1 },
  btnMainTxt: { fontSize: 14, color: '#fff' },
});
