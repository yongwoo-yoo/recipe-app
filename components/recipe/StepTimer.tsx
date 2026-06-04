import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useTimerStore } from '@/store/timerStore';
import { CountdownTimer } from '@/components/timer/CountdownTimer';
import { formatTime } from '@/utils/formatTime';
import { appleColors } from '@/constants/theme';
import type { RecipeStep } from '@/types';

interface Props {
  step: RecipeStep;
  recipeId: string;
}

export function StepTimer({ step, recipeId }: Props) {
  const { activeStepId, recipeId: activeRecipeId, startTimer } = useTimerStore();

  if (!step.timer) return null;

  const isActive = activeStepId === step.id && activeRecipeId === recipeId;
  const { durationSeconds, label } = step.timer;

  if (isActive) return <CountdownTimer />;

  return (
    <Pressable
      style={styles.chip}
      onPress={() => startTimer(step.id, recipeId, durationSeconds)}
    >
      <Text style={styles.chipIcon}>⏱</Text>
      <Text style={styles.chipTime}>{label || formatTime(durationSeconds)}</Text>
      <Text style={styles.chipStart}>시작</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: appleColors.surface2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: appleColors.gray5,
  },
  chipIcon: { fontSize: 13 },
  chipTime: { fontSize: 13, fontWeight: '600', color: appleColors.gray1 },
  chipStart: { fontSize: 12, color: appleColors.accent, fontWeight: '600', marginLeft: 2 },
});
