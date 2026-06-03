import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { appleColors } from '@/constants/theme';
import { formatTime } from '@/utils/formatTime';
import type { Recipe } from '@/types';

interface Props {
  recipe: Recipe;
}

export function TotalTimer({ recipe }: Props) {
  const stepTotalSeconds = recipe.steps
    .filter((s) => s.timer?.durationSeconds)
    .reduce((sum, s) => sum + (s.timer?.durationSeconds ?? 0), 0);

  const [duration, setDuration] = useState(stepTotalSeconds);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleStart = (sec: number) => {
    setDuration(sec);
    setRemaining(sec);
    setIsRunning(true);
    setIsStarted(true);
  };

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);
  const handleReset = () => {
    setIsRunning(false);
    setIsStarted(false);
    setRemaining(0);
  };

  const applyCustom = () => {
    const mins = parseInt(customInput, 10);
    if (!isNaN(mins) && mins > 0) {
      handleStart(mins * 60);
      setCustomInput('');
    }
  };

  const progress = duration > 0 ? remaining / duration : 0;
  const isFinished = isStarted && remaining === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏱ 전체 타이머</Text>

      {isStarted ? (
        // 타이머 실행 중 UI
        <View style={styles.running}>
          <Text style={[styles.bigTime, isFinished && { color: appleColors.red }]}>
            {isFinished ? '완료!' : formatTime(remaining)}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <View style={styles.btnRow}>
            <Pressable onPress={handleReset} style={styles.ctrlBtn} hitSlop={8}>
              <Text style={styles.ctrlIcon}>↺</Text>
            </Pressable>
            <Pressable
              onPress={isRunning ? handlePause : handleResume}
              style={[styles.ctrlBtn, styles.ctrlBtnPrimary]}
            >
              <Text style={styles.ctrlIconPrimary}>{isRunning ? '⏸' : '▶'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // 타이머 시작 전 UI
        <View style={styles.presets}>
          {stepTotalSeconds > 0 && (
            <Pressable style={styles.presetBtn} onPress={() => handleStart(stepTotalSeconds)}>
              <Text style={styles.presetLabel}>단계 합계</Text>
              <Text style={styles.presetTime}>{formatTime(stepTotalSeconds)}</Text>
            </Pressable>
          )}
          {[10, 15, 20, 30].map((min) => (
            <Pressable key={min} style={styles.presetBtn} onPress={() => handleStart(min * 60)}>
              <Text style={styles.presetTime}>{min}분</Text>
            </Pressable>
          ))}
          <View style={styles.customRow}>
            <RNTextInput
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="직접 입력(분)"
              keyboardType="number-pad"
              style={styles.customInput}
              placeholderTextColor={appleColors.gray3}
              onSubmitEditing={applyCustom}
            />
            <Pressable style={styles.customStart} onPress={applyCustom}>
              <Text style={styles.customStartText}>시작</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: appleColors.white,
    padding: 18,
    borderWidth: 1,
    borderColor: appleColors.gray5,
    gap: 14,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: appleColors.gray3,
  },

  // 실행 중
  running: { alignItems: 'center', gap: 12 },
  bigTime: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1,
    color: appleColors.gray1,
    fontVariant: ['tabular-nums'] as any,
  },
  progressBar: {
    width: '100%', height: 6,
    backgroundColor: appleColors.gray5,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: appleColors.accent,
    borderRadius: 3,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctrlBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: appleColors.gray5,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlBtnPrimary: { backgroundColor: appleColors.gray1, width: 52, height: 52, borderRadius: 26 },
  ctrlIcon: { fontSize: 20, color: appleColors.gray2 },
  ctrlIconPrimary: { fontSize: 20, color: '#fff' },

  // 시작 전
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: appleColors.gray4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetLabel: { fontSize: 10, color: appleColors.gray3, marginBottom: 2 },
  presetTime: { fontSize: 14, fontWeight: '700', color: appleColors.gray1 },

  customRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', marginTop: 4 },
  customInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: appleColors.gray4,
    paddingHorizontal: 12,
    fontSize: 14,
    color: appleColors.gray1,
    backgroundColor: appleColors.white,
  },
  customStart: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: appleColors.gray1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customStartText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
