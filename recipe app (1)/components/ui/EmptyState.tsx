import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { appleColors } from '@/constants/theme';

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍳</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.btn} labelStyle={styles.btnLabel}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10 },
  emoji: { fontSize: 52, marginBottom: 4 },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: appleColors.gray1,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    color: appleColors.gray2,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: { marginTop: 8, borderRadius: 20 },
  btnLabel: { fontSize: 14, fontWeight: '600' },
});
