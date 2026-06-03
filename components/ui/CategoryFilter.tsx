import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import {
  CATEGORY_GROUPS,
  getCategoriesForGroup,
  CATEGORY_GROUP_MAP,
  type CategoryGroup,
} from '@/constants/categories';
import { useUIStore } from '@/store/uiStore';
import { appleColors } from '@/constants/theme';
import type { CategoryId } from '@/types';

export function CategoryFilter() {
  const { activeGroup, activeCategoryId, setActiveGroup, setActiveCategory } = useUIStore();

  const subCategories = getCategoriesForGroup(activeGroup).filter(
    (c) => activeGroup === 'all' || CATEGORY_GROUP_MAP[c.id] === activeGroup
  );

  return (
    <View style={styles.wrapper}>
      {/* 그룹 탭 */}
      <View style={[styles.groupRow, { borderBottomColor: appleColors.gray5 }]}>
        {CATEGORY_GROUPS.map((g) => {
          const isActive = activeGroup === g.id;
          return (
            <Pressable
              key={g.id}
              onPress={() => setActiveGroup(g.id)}
              style={styles.groupTab}
            >
              <Text style={[styles.groupLabel, isActive && styles.groupLabelActive]}>
                {g.label}
              </Text>
              {isActive && <View style={[styles.groupUnderline, { backgroundColor: appleColors.gray1 }]} />}
            </Pressable>
          );
        })}
      </View>

      {/* 서브 칩 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {/* 전체 칩 */}
        <Pressable
          onPress={() => setActiveCategory('all')}
          style={[
            styles.chip,
            activeCategoryId === 'all'
              ? { backgroundColor: appleColors.gray1, borderColor: appleColors.gray1 }
              : { backgroundColor: appleColors.white, borderColor: appleColors.gray5 },
          ]}
        >
          <Text style={[styles.chipText, activeCategoryId === 'all' ? { color: '#fff' } : { color: appleColors.gray2 }]}>
            전체
          </Text>
        </Pressable>

        {subCategories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id as CategoryId)}
              style={[
                styles.chip,
                isActive
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : { backgroundColor: appleColors.white, borderColor: appleColors.gray5 },
              ]}
            >
              <Text style={[styles.chipText, { color: isActive ? '#fff' : appleColors.gray2 }]}>
                {cat.emoji}  {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: appleColors.white,
    borderBottomWidth: 1,
    borderBottomColor: appleColors.gray5,
  },
  groupRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: appleColors.gray5,
  },
  groupTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: appleColors.gray3,
    letterSpacing: -0.2,
  },
  groupLabelActive: {
    color: appleColors.gray1,
    fontWeight: '700',
  },
  groupUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
  },
  chipRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
  },
  chip: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600', letterSpacing: -0.1 },
});
