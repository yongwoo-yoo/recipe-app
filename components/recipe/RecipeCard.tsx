import React from 'react';
import { Pressable, StyleSheet, View, Image, Platform } from 'react-native';
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
        pressed && { opacity: 0.88 },
        Platform.OS === 'web' && hovered && styles.hovered,
      ]}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* 4:3 미디어 영역 */}
        <View style={styles.media}>
          {recipe.imageUri
            ? <Image source={{ uri: recipe.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.color + '28' }]} />
          }
          {/* 카테고리 이모지 (이미지 없을 때) */}
          {!recipe.imageUri && (
            <Text style={styles.mediaEmoji}>{cat.emoji}</Text>
          )}
          {/* 플로팅 배지 */}
          <View style={[styles.badge, { backgroundColor: 'rgba(255,253,250,0.92)' }]}>
            <Text style={[styles.badgeText, { color: cat.color }]}>{cat.emoji}  {cat.label}</Text>
          </View>
        </View>

        {/* 텍스트 영역 */}
        <View style={styles.content}>
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
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.meta}>{recipe.steps.length}단계</Text>
            {recipe.steps.some((s) => s.timer) && (
              <>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.meta}>⏱</Text>
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
  hovered: { transform: [{ translateY: -3 }] },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 14px rgba(34,31,26,0.08)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' } as any
      : { shadowColor: '#221F1A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 }),
  },
  media: {
    aspectRatio: 4 / 3,
    backgroundColor: appleColors.surface2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaEmoji: { fontSize: 44, opacity: 0.5 },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.1 },
  content: { padding: 14, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3, lineHeight: 22 },
  desc: { fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta: { fontSize: 12, color: appleColors.gray3 },
  metaDot: { fontSize: 12, color: appleColors.gray4 },
});
