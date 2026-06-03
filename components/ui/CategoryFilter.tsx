import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CATEGORY_GROUPS, getCategoriesForGroup, CATEGORY_GROUP_MAP, type CategoryGroup } from '@/constants/categories';
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
      {/* Group tabs: 전체 / 요리 / 커피 */}
      <View style={styles.groupRow}>
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
              {isActive && <View style={styles.groupUnderline} />}
            </Pressable>
          );
        })}
      </View>

      {/* Sub-category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <Pressable
          onPress={() => setActiveCategory('all')}
          style={[
            styles.chip,
            activeCategoryId === 'all'
              ? styles.chipActive
              : styles.chipInactive,
          ]}
        >
          <Text style={[styles.chipText, activeCategoryId === 'all' && styles.chipTextActive]}>
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
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: appleColors.gray5,
  },

  // Group tab row
  groupRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
    fontWeight: '600',
  },
  groupUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: appleColors.gray1,
  },

  // Chip row
  chipRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
  },
  chip: {
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: appleColors.gray1,
    borderColor: appleColors.gray1,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: appleColors.gray4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: appleColors.gray2,
    letterSpacing: -0.1,
  },
  chipTextActive: {
    color: '#ffffff',
  },
});
