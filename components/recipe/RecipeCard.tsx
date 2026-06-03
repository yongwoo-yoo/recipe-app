import React from 'react';
import { Pressable, StyleSheet, View, Image, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { getCategoryById } from '@/constants/categories';
import { appleColors } from '@/constants/theme';
import type { Recipe } from '@/types';

interface Props {
  recipe: Recipe;
  horizontal?: boolean; // 폰용 가로형 레이아웃
}

export function RecipeCard({ recipe, horizontal }: Props) {
  const theme = useTheme();
  const cat = getCategoryById(recipe.categoryId);

  if (horizontal) {
    return (
      <Pressable
        onPress={() => router.push(`/recipe/${recipe.id}`)}
        style={({ pressed }) => [hStyles.wrapper, pressed && { opacity: 0.85 }]}
      >
        <View style={[hStyles.card, { backgroundColor: theme.colors.surface }]}>
          {/* 섬네일 */}
          <View style={[hStyles.thumb, { backgroundColor: cat.color + '28' }]}>
            {recipe.imageUri
              ? <Image source={{ uri: recipe.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              : null
            }
            <Text style={hStyles.thumbEmoji}>{cat.emoji}</Text>
          </View>

          {/* 내용 */}
          <View style={hStyles.content}>
            <View style={[hStyles.catBadge, { backgroundColor: cat.color + '20' }]}>
              <Text style={[hStyles.catText, { color: cat.color }]}>{cat.label}</Text>
            </View>
            <Text style={[hStyles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
              {recipe.title}
            </Text>
            {recipe.brewingTool ? (
              <Text style={hStyles.tool}>🫖 {recipe.brewingTool}</Text>
            ) : recipe.description ? (
              <Text style={hStyles.desc} numberOfLines={1}>{recipe.description}</Text>
            ) : null}
            <View style={hStyles.footer}>
              {recipe.ingredients.length > 0 && (
                <Text style={hStyles.meta}>{recipe.ingredients.length}가지 재료</Text>
              )}
              <Text style={hStyles.dot}>·</Text>
              <Text style={hStyles.meta}>{recipe.steps.length}단계</Text>
              {recipe.steps.some((s) => s.timer) && (
                <><Text style={hStyles.dot}>·</Text><Text style={hStyles.meta}>⏱</Text></>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // ── 그리드 카드 (웹/태블릿) ──────────────────────────────────
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
        <View style={styles.media}>
          {recipe.imageUri
            ? <Image source={{ uri: recipe.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.color + '28' }]} />
          }
          {!recipe.imageUri && (
            <Text style={styles.mediaEmoji}>{cat.emoji}</Text>
          )}
          <View style={[styles.badge, { backgroundColor: 'rgba(255,253,250,0.92)' }]}>
            <Text style={[styles.badgeText, { color: cat.color }]}>{cat.emoji}  {cat.label}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {recipe.title}
          </Text>
          {recipe.description ? (
            <Text style={[styles.desc, { color: appleColors.gray2 }]} numberOfLines={2}>
              {recipe.description}
            </Text>
          ) : null}
          {recipe.brewingTool ? (
            <View style={styles.toolBadge}>
              <Text style={styles.toolBadgeText}>🫖 {recipe.brewingTool}</Text>
            </View>
          ) : null}
          <View style={styles.footer}>
            {recipe.ingredients.length > 0 && (
              <Text style={styles.meta}>{recipe.ingredients.length}가지 재료</Text>
            )}
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.meta}>{recipe.steps.length}단계</Text>
            {recipe.steps.some((s) => s.timer) && (
              <><Text style={styles.metaDot}>·</Text><Text style={styles.meta}>⏱</Text></>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ── Horizontal card styles ────────────────────────────────────
const hStyles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden' },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: appleColors.gray5,
    shadowColor: '#221F1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbEmoji: { fontSize: 30, opacity: 0.7 },
  content: {
    flex: 1,
    padding: 12,
    paddingVertical: 10,
    gap: 4,
    justifyContent: 'center',
  },
  catBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3, lineHeight: 20 },
  desc: { fontSize: 12, color: appleColors.gray3, lineHeight: 16 },
  tool: { fontSize: 12, color: '#10A37F', fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta: { fontSize: 11, color: appleColors.gray3 },
  dot: { fontSize: 11, color: appleColors.gray4 },
});

// ── Grid card styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { flex: 1, minWidth: 0 },
  hovered: { transform: [{ translateY: -3 }] },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: appleColors.gray5,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 14px rgba(34,31,26,0.06)', transition: 'transform 0.18s cubic-bezier(.2,.7,.3,1), box-shadow 0.18s ease' } as any
      : { shadowColor: '#221F1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }),
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
    top: 10, left: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: -0.1 },
  content: { padding: 14, paddingBottom: 16, gap: 5 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.4, lineHeight: 21 },
  desc: { fontSize: 12, lineHeight: 17 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta: { fontSize: 11, color: appleColors.gray3 },
  metaDot: { fontSize: 11, color: appleColors.gray4 },
  toolBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10A37F18',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  toolBadgeText: { fontSize: 11, fontWeight: '600', color: '#10A37F' },
});
