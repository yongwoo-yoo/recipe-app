import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { appleColors } from '@/constants/theme';

export type ImportMethod = 'text' | 'youtube' | 'url' | 'image';

interface MethodItem {
  id: ImportMethod;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  desc: string;
  disabled?: boolean;
}

const METHODS: MethodItem[] = [
  { id: 'text',    icon: 'text',        label: '텍스트',  desc: '복사한 레시피 붙여넣기' },
  { id: 'youtube', icon: 'youtube',     label: 'YouTube', desc: '영상 설명·자막 붙여넣기' },
  { id: 'url',     icon: 'link-variant',label: '웹 URL',  desc: '레시피 페이지 내용' },
  { id: 'image',   icon: 'camera',      label: '사진',    desc: '레시피 사진 (준비 중)', disabled: false },
];

interface Props {
  selected: ImportMethod;
  onSelect: (method: ImportMethod) => void;
}

export function ImportMethodSheet({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {METHODS.map((m) => {
        const isActive = selected === m.id;
        return (
          <Pressable
            key={m.id}
            onPress={() => onSelect(m.id)}
            style={({ pressed }) => [
              styles.item,
              isActive ? styles.itemActive : styles.itemInactive,
              pressed && { opacity: 0.82 },
            ]}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <MaterialCommunityIcons
                name={m.icon}
                size={22}
                color={isActive ? appleColors.white : appleColors.gray2}
              />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {m.label}
              </Text>
              <Text style={styles.desc}>{m.desc}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    flex: 1,
    minWidth: 140,
    borderWidth: 1.5,
  },
  itemInactive: {
    backgroundColor: appleColors.white,
    borderColor: appleColors.gray5,
  },
  itemActive: {
    backgroundColor: appleColors.surface2,
    borderColor: appleColors.gray1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECE6DB',
    flexShrink: 0,
  },
  iconWrapActive: {
    backgroundColor: appleColors.gray1,
  },
  textWrap: { flex: 1 },
  label: { fontSize: 14, fontWeight: '700', color: appleColors.gray2, letterSpacing: -0.1 },
  labelActive: { color: appleColors.gray1 },
  desc: { fontSize: 12, color: appleColors.gray3, marginTop: 2, lineHeight: 16 },
});
