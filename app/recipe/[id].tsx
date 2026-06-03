import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Platform, Image, Pressable } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { StepTimer } from '@/components/recipe/StepTimer';
import { getCategoryById } from '@/constants/categories';
import { appleColors } from '@/constants/theme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getRecipeById = useRecipeStore((s) => s.getRecipeById);
  const recipe = getRecipeById(id);
  const theme = useTheme();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>레시피를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const cat = getCategoryById(recipe.categoryId);
  const toggleCheck = (itemId: string) =>
    setChecked((c) => ({ ...c, [itemId]: !c[itemId] }));

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerRight: () => (
            <Button
              onPress={() => router.push(`/recipe/${id}/edit`)}
              labelStyle={{ fontSize: 15, fontWeight: '600', color: appleColors.white }}
            >
              편집
            </Button>
          ),
        }}
      />
      <ScrollView
        style={[styles.root, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.container}
      >
        {/* ── 풀블리드 히어로 ── */}
        <View style={[styles.hero, { backgroundColor: cat.color + '30' }]}>
          {recipe.imageUri
            ? <Image source={{ uri: recipe.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.color + '30' }]} />
          }
          <Text style={styles.heroEmojiBg}>{cat.emoji}</Text>
          <LinearGradient
            colors={['transparent', 'rgba(15,10,4,0.68)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: cat.color }]}>
              <Text style={styles.heroBadgeText}>{cat.emoji}  {cat.label}</Text>
            </View>
            <Text style={styles.heroTitle}>{recipe.title}</Text>
            {/* 스탯 행 */}
            <View style={styles.heroStats}>
              {recipe.servings ? (
                <Text style={styles.heroStat}>🍽  {recipe.servings}</Text>
              ) : null}
              {recipe.ingredients.length > 0 && (
                <Text style={styles.heroStat}>· {recipe.ingredients.length}가지 재료</Text>
              )}
              {recipe.steps.length > 0 && (
                <Text style={styles.heroStat}>· {recipe.steps.length}단계</Text>
              )}
            </View>
            {recipe.description ? (
              <Text style={styles.heroDesc}>{recipe.description}</Text>
            ) : null}
          </View>
        </View>

        {/* ── 재료 (체크리스트) ── */}
        {recipe.ingredients.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.sectionTitle}>재료</Text>
            {recipe.ingredients.map((item, idx) => {
              const done = !!checked[item.id];
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleCheck(item.id)}
                  style={[
                    styles.ingredientRow,
                    idx < recipe.ingredients.length - 1 && { borderBottomWidth: 1, borderBottomColor: appleColors.gray5 },
                  ]}
                >
                  {/* 체크박스 */}
                  <View style={[styles.checkbox, done && { backgroundColor: appleColors.gray1, borderColor: appleColors.gray1 }]}>
                    {done && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.ingredientName, { color: theme.colors.onSurface }, done && styles.strikethrough]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.ingredientQty, done && { color: appleColors.gray4 }]}>
                    {item.quantity}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── 조리 단계 ── */}
        {recipe.steps.length > 0 && (
          <View style={styles.stepsSection}>
            <Text style={[styles.sectionTitle, { paddingLeft: 4 }]}>조리 단계</Text>
            {recipe.steps.map((step, idx) => (
              <View key={step.id} style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.stepNumWrap, { backgroundColor: appleColors.surface2, borderRadius: 11 }]}>
                  <Text style={[styles.stepNum, { color: appleColors.gray1 }]}>{idx + 1}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={[styles.stepText, { color: theme.colors.onSurface }]}>
                    {step.instruction}
                  </Text>
                  <StepTimer step={step} recipeId={recipe.id} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── 메모 ── */}
        {recipe.notes ? (
          <View style={[styles.section, { backgroundColor: appleColors.orange + '14', borderColor: appleColors.orange + '40', borderWidth: 1 }]}>
            <Text style={styles.sectionTitle}>메모</Text>
            <Text style={[styles.notes, { color: theme.colors.onSurface }]}>{recipe.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingBottom: 60 },

  // Hero
  hero: {
    aspectRatio: 16 / 7,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginHorizontal: 0,
  },
  heroEmojiBg: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    fontSize: 110,
    opacity: 0.18,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 28,
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  heroStat: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginTop: 2 },

  // Sections
  section: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 6px rgba(34,31,26,0.06)' } as any
      : { shadowColor: '#221F1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }),
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: appleColors.gray2,
    padding: 16,
    paddingBottom: 8,
  },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: appleColors.gray4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkMark: { fontSize: 12, color: '#fff', fontWeight: '700' },
  ingredientName: { flex: 1, fontSize: 15 },
  ingredientQty: { fontSize: 15, color: appleColors.gray2 },
  strikethrough: { textDecorationLine: 'line-through', color: appleColors.gray3 },

  // Steps
  stepsSection: { marginHorizontal: 16, marginTop: 14, gap: 10 },
  stepCard: {
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 6px rgba(34,31,26,0.06)' } as any
      : { shadowColor: '#221F1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }),
  },
  stepNumWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { fontSize: 14, fontWeight: '700' },
  stepBody: { flex: 1, gap: 8 },
  stepText: { fontSize: 15, lineHeight: 22 },

  // Notes
  notes: { fontSize: 15, lineHeight: 22, padding: 16, paddingTop: 0 },
});
