import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export type ImportMethod = 'youtube' | 'image' | 'text' | 'url';

interface MethodItem {
  id: ImportMethod;
  emoji: string;
  label: string;
  desc: string;
}

const METHODS: MethodItem[] = [
  { id: 'youtube', emoji: '▶️', label: 'YouTube', desc: '유튜브 영상 URL 붙여넣기' },
  { id: 'image',   emoji: '📷', label: '사진',    desc: '레시피 책이나 화면 촬영' },
  { id: 'text',    emoji: '📝', label: '텍스트',  desc: '복사한 레시피 붙여넣기' },
  { id: 'url',     emoji: '🌐', label: '웹 URL',  desc: '레시피 사이트 URL' },
];

interface Props {
  selected: ImportMethod;
  onSelect: (method: ImportMethod) => void;
}

export function ImportMethodSheet({ selected, onSelect }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {METHODS.map((m) => {
        const isActive = selected === m.id;
        return (
          <Pressable
            key={m.id}
            onPress={() => onSelect(m.id)}
            style={[
              styles.item,
              {
                backgroundColor: isActive ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                borderColor: isActive ? theme.colors.primary : 'transparent',
                borderWidth: 2,
              },
            ]}
          >
            <Text style={styles.emoji}>{m.emoji}</Text>
            <View>
              <Text variant="labelLarge" style={isActive && { color: theme.colors.primary }}>
                {m.label}
              </Text>
              <Text variant="bodySmall" style={styles.desc}>{m.desc}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, flex: 1, minWidth: 140 },
  emoji: { fontSize: 24 },
  desc: { opacity: 0.6, marginTop: 2 },
});
