import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { getCategoryById } from '@/constants/categories';
import type { CategoryId } from '@/types';

interface Props {
  categoryId: CategoryId;
  small?: boolean;
}

export function CategoryChip({ categoryId, small }: Props) {
  const cat = getCategoryById(categoryId);
  return (
    <Chip
      style={[styles.chip, { backgroundColor: cat.color + '33' }]}
      textStyle={[styles.text, small && styles.smallText]}
      compact
    >
      {cat.emoji} {cat.label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start' },
  text: { fontSize: 13 },
  smallText: { fontSize: 11 },
});
