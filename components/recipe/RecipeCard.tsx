import React from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { getCategoryById } from '@/constants/categories';
import { appleColors } from '@/constants/theme';
import type { Recipe } from '@/types';

interface Props {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: Props) {
  const theme = useTheme();
  const cat = getCategoryById(recipe.categoryId);

  return (
    <Pressable
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      style={({ pressed, hovered }: any) => [
        styles.wrapper,
        pressed && styles.pressed,
        Platform.OS === 'web' && hovered && styles.hovered,
      ]}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Color accent bar */}
        <View style={[styles.accentBar, { backgroundColor: cat.color }]} />

        <View style={styles.content}>
          {/* Category badge */}
          <View style={[styles.badge, { backgroundColor: cat.color + '18' }]}>
            <Text style={[styles.badgeText, { color: cat.color }]}>
              {cat.emoji}  {cat.label}
            </Text>
          </View>

          <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {recipe.title}
          </Text>

          {recipe.description ? (
            <Text style={[styles.desc, { color: appleColors.gray2 }]} numberOfLines={2}>
              {recipe.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            {recipe.ingredients.length > 0 && (
              <Text style={styles.meta}>{recipe.ingredients.length}가지 재료</Text>
            )}
            <Text style={styles.meta}>·</Text>
            <Text style={styles.meta}>{recipe.steps.length}단계</Text>
            {recipe.steps.some((s) => s.timer) && (
              <>
                <Text style={styles.meta}>·</Text>
                <Text style={styles.meta}>⏱ 타이머</Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: 6 },
  pressed: { opacity: 0.85 },
  hovered: { transform: [{ translateY: -2 }] },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }
    ),
  },
  accentBar: { height: 4, width: '100%' },
  content: { padding: 14, gap: 8 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  title: { fontSize: 16, fontWeight: '600', letterSpacing: -0.3, lineHeight: 22 },
  desc: { fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  meta: { fontSize: 12, color: appleColors.gray3, letterSpacing: -0.1 },
});
