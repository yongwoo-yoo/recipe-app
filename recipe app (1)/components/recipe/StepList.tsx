import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Button, Text, Switch } from 'react-native-paper';
import type { RecipeStep } from '@/types';

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface Props {
  steps: RecipeStep[];
  onChange: (steps: RecipeStep[]) => void;
}

export function StepList({ steps, onChange }: Props) {
  const add = () =>
    onChange([...steps, { id: genId(), instruction: '' }]);

  const update = (id: string, patch: Partial<RecipeStep>) =>
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: string) =>
    onChange(steps.filter((s) => s.id !== id));

  const toggleTimer = (step: RecipeStep) => {
    if (step.timer) {
      update(step.id, { timer: undefined });
    } else {
      update(step.id, { timer: { durationSeconds: 60, label: '' } });
    }
  };

  const updateTimer = (id: string, field: 'minutes' | 'seconds' | 'label', value: string) => {
    const step = steps.find((s) => s.id === id);
    if (!step?.timer) return;
    if (field === 'label') {
      update(id, { timer: { ...step.timer, label: value } });
    } else {
      const mins = field === 'minutes' ? parseInt(value || '0') : Math.floor(step.timer.durationSeconds / 60);
      const secs = field === 'seconds' ? parseInt(value || '0') : step.timer.durationSeconds % 60;
      update(id, { timer: { ...step.timer, durationSeconds: Math.max(0, mins * 60 + secs) } });
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.sectionLabel}>조리 단계</Text>
      {steps.map((step, idx) => (
        <View key={step.id} style={styles.stepBlock}>
          <View style={styles.stepHeader}>
            <Text variant="labelMedium" style={styles.stepNum}>{idx + 1}단계</Text>
            <IconButton icon="close" size={16} onPress={() => remove(step.id)} />
          </View>
          <TextInput
            label="조리 방법"
            value={step.instruction}
            onChangeText={(v) => update(step.id, { instruction: v })}
            multiline
            numberOfLines={2}
            mode="outlined"
            dense
          />
          <View style={styles.timerToggleRow}>
            <Text variant="bodySmall">타이머 설정</Text>
            <Switch value={!!step.timer} onValueChange={() => toggleTimer(step)} />
          </View>
          {step.timer && (
            <View style={styles.timerInputs}>
              <TextInput
                label="분"
                value={String(Math.floor(step.timer.durationSeconds / 60))}
                onChangeText={(v) => updateTimer(step.id, 'minutes', v)}
                keyboardType="number-pad"
                style={styles.timerNum}
                dense
                mode="outlined"
              />
              <Text style={styles.colon}>:</Text>
              <TextInput
                label="초"
                value={String(step.timer.durationSeconds % 60)}
                onChangeText={(v) => updateTimer(step.id, 'seconds', v)}
                keyboardType="number-pad"
                style={styles.timerNum}
                dense
                mode="outlined"
              />
              <TextInput
                label="설명 (선택)"
                value={step.timer.label ?? ''}
                onChangeText={(v) => updateTimer(step.id, 'label', v)}
                style={styles.timerLabel}
                dense
                mode="outlined"
              />
            </View>
          )}
        </View>
      ))}
      <Button icon="plus" onPress={add} mode="outlined" compact style={styles.addBtn}>
        단계 추가
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  sectionLabel: { marginBottom: 4, opacity: 0.7 },
  stepBlock: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, gap: 8 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepNum: { fontWeight: '700', opacity: 0.7 },
  timerToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timerInputs: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerNum: { width: 64 },
  colon: { fontSize: 18, fontWeight: '600' },
  timerLabel: { flex: 1 },
  addBtn: { alignSelf: 'flex-start', marginTop: 4 },
});
