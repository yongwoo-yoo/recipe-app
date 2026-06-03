import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { useTimerStore } from '@/store/timerStore';
import { formatTime } from '@/utils/formatTime';

export function CountdownTimer() {
  const { remainingSeconds, totalSeconds, isRunning, pauseTimer, resumeTimer, resetTimer } =
    useTimerStore();
  const theme = useTheme();

  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const isFinished = remainingSeconds === 0 && totalSeconds > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
      <Text
        variant="displaySmall"
        style={[styles.time, isFinished && { color: theme.colors.error }]}
      >
        {isFinished ? '완료!' : formatTime(remainingSeconds)}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%` as any,
              backgroundColor: isFinished ? theme.colors.error : theme.colors.primary,
            },
          ]}
        />
      </View>
      <View style={styles.controls}>
        <IconButton
          icon="refresh"
          size={24}
          onPress={resetTimer}
          iconColor={theme.colors.onPrimaryContainer}
        />
        <IconButton
          icon={isRunning ? 'pause' : 'play'}
          size={32}
          onPress={isRunning ? pauseTimer : resumeTimer}
          iconColor={theme.colors.onPrimaryContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, padding: 16, alignItems: 'center', gap: 8 },
  time: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  progressBar: { width: '100%', height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  controls: { flexDirection: 'row', alignItems: 'center' },
});
