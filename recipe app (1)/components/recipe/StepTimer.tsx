import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTimerStore } from '@/store/timerStore';
import { CountdownTimer } from '@/components/timer/CountdownTimer';
import { formatTime } from '@/utils/formatTime';
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

  return (
    <View style={styles.container}>
      {isActive ? (
        <CountdownTimer />
      ) : (
        <View style={styles.preview}>
          <Text variant="bodySmall" style={styles.label}>
            {label ? `⏱ ${label}` : `⏱ ${formatTime(durationSeconds)}`}
          </Text>
          <Button
            mode="contained-tonal"
            compact
            onPress={() => startTimer(step.id, recipeId, durationSeconds)}
          >
            타이머 시작
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  preview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { opacity: 0.7 },
});
