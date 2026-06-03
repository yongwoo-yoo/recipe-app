import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Button, Text } from 'react-native-paper';
import type { Ingredient } from '@/types';

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface Props {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export function IngredientList({ ingredients, onChange }: Props) {
  const add = () =>
    onChange([...ingredients, { id: genId(), name: '', quantity: '' }]);

  const update = (id: string, field: 'name' | 'quantity', value: string) =>
    onChange(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const remove = (id: string) =>
    onChange(ingredients.filter((i) => i.id !== id));

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.sectionLabel}>재료</Text>
      {ingredients.map((item, idx) => (
        <View key={item.id} style={styles.row}>
          <TextInput
            label="재료명"
            value={item.name}
            onChangeText={(v) => update(item.id, 'name', v)}
            style={styles.nameInput}
            dense
            mode="outlined"
          />
          <TextInput
            label="양"
            value={item.quantity}
            onChangeText={(v) => update(item.id, 'quantity', v)}
            style={styles.qtyInput}
            dense
            mode="outlined"
          />
          <IconButton
            icon="close"
            size={18}
            onPress={() => remove(item.id)}
          />
        </View>
      ))}
      <Button icon="plus" onPress={add} mode="outlined" compact style={styles.addBtn}>
        재료 추가
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  sectionLabel: { marginBottom: 4, opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nameInput: { flex: 2 },
  qtyInput: { flex: 1 },
  addBtn: { alignSelf: 'flex-start', marginTop: 4 },
});
