import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Platform, Image, Pressable, useWindowDimensions, Alert } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { StepTimer } from '@/components/recipe/StepTimer';
import { TotalTimer } from '@/components/timer/TotalTimer';
import { getCategoryById } from '@/constants/categories';
import { appleColors } from '@/constants/theme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getRecipeById = useRecipeStore((s) => s.getRecipeById);
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);
  const recipe = getRecipeById(id);
  const theme = useTheme();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const handleDelete = () => {
    const doDelete = () => { deleteRecipe(id); router.push('/'); };
    if (Platform.OS === 'web') {
      if ((window as any).confirm('정말 삭제하시겠습니까?')) doDelete();
    } else {
      Alert.alert('레시피 삭제', '정말 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>레시피를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const cat = getCategoryById(recipe.categoryId);
  const { width } = useWindowDimensions();
  const isTwoCol = Platform.OS === 'web' && width >= 860;
  const toggleCheck = (itemId: string) =>
    setChecked((c) => ({ ...c, [itemId]: !c[itemId] }));

  const hasTimers = recipe.steps.some((s) => s.timer);

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
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
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
          </View>
        </View>

        {/* ── 요약 + 출처 카드 ── */}
        {(recipe.description || recipe.source) && (
          <View style={styles.summaryCard}>
            {recipe.description ? (
              <Text style={styles.summaryDesc}>{recipe.description}</Text>
            ) : null}
            {recipe.source ? (
              <Text style={styles.summarySource} numberOfLines={2}>🔗 {recipe.source}</Text>
            ) : null}
          </View>
        )}

        {/* ── body: 재료 + 단계 (웹에서 2컬럼) ── */}
        <View style={isTwoCol ? styles.bodyGrid : undefined}>

          {/* 재료 패널 */}
          {recipe.ingredients.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.colors.surface }, isTwoCol && styles.ingredientsPanel]}>
              <Text style={styles.panelMono}>INGREDIENTS</Text>
              <Text style={styles.panelH}>재료</Text>
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

          {/* 전체 타이머 — 재료 아래 */}
          {!isTwoCol && hasTimers && (
            <TotalTimer recipe={recipe} />
          )}

          {/* 단계 + 메모 */}
          <View style={isTwoCol ? styles.stepsCol : undefined}>
            {recipe.steps.length > 0 && (
              <View style={styles.stepsSection}>
                <Text style={[styles.panelMono, { paddingLeft: 2 }]}>DIRECTIONS</Text>
                <Text style={[styles.panelH, { paddingLeft: 2 }]}>조리 단계</Text>
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

            {recipe.notes ? (
              <View style={[styles.section, { backgroundColor: appleColors.orange + '14', borderColor: appleColors.orange + '40', borderWidth: 1, marginTop: recipe.steps.length > 0 ? 0 : 14 }]}>
                <Text style={[styles.panelMono, { color: '#C8862A' }]}>NOTES</Text>
                <Text style={[styles.notes, { color: theme.colors.onSurface }]}>{recipe.notes}</Text>
              </View>
            ) : null}
          </View>

        </View>

        {/* ── 편집 / 삭제 액션 ── */}
        <View style={styles.actionBar}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionEdit, pressed && { opacity: 0.82 }]}
            onPress={() => router.push(`/recipe/${id}/edit`)}
          >
            <Text style={styles.actionEditText}>✏️  편집</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionDelete, pressed && { opacity: 0.82 }]}
            onPress={handleDelete}
          >
            <Text style={styles.actionDeleteText}>🗑  삭제</Text>
          </Pressable>
        </View>

      </ScrollView>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingBottom: 80 },

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
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: appleColors.white,
    borderWidth: 1,
    borderColor: appleColors.gray5,
    gap: 6,
  },
  summaryDesc: { fontSize: 14, lineHeight: 20, color: appleColors.gray1 },
  summarySource: { fontSize: 12, color: appleColors.gray3, lineHeight: 17 },

  // 2-column grid (web ≥860px)
  bodyGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  ingredientsPanel: {
    width: 300,
    flexShrink: 0,
    marginHorizontal: 0,
    marginTop: 0,
    ...(Platform.OS === 'web' ? { position: 'sticky', top: 92 } as any : {}),
  },
  stepsCol: { flex: 1, minWidth: 0 },

  // Sections
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: appleColors.gray5,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 6px rgba(34,31,26,0.06)' } as any
      : { shadowColor: '#221F1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }),
  },
  panelMono: {
    fontFamily: Platform.OS === 'web' ? "'JetBrains Mono', monospace" : undefined,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    color: appleColors.gray3,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 2,
  },
  panelH: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: appleColors.gray1,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
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
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  stepsSection: { marginHorizontal: 16, marginTop: 16, gap: 10, flex: 1 },
  stepCard: {
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
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
  notes: { fontSize: 15, lineHeight: 22, padding: 20, paddingTop: 4 },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  actionEdit: {
    borderColor: appleColors.gray4,
    backgroundColor: appleColors.white,
  },
  actionDelete: {
    borderColor: '#E2574C40',
    backgroundColor: '#E2574C0D',
  },
  actionEditText: { fontSize: 15, fontWeight: '600', color: appleColors.gray1 },
  actionDeleteText: { fontSize: 15, fontWeight: '600', color: '#E2574C' },
});
