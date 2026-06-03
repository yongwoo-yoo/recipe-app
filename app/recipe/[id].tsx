import React from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
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

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>레시피를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const cat = getCategoryById(recipe.categoryId);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Button
              onPress={() => router.push(`/recipe/${id}/edit`)}
              labelStyle={{ fontSize: 15, fontWeight: '500' }}
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
        {/* Hero header */}
        <View style={[styles.hero, { backgroundColor: cat.color + '14' }]}>
          <Text style={styles.heroEmoji}>{cat.emoji}</Text>
          <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>{recipe.title}</Text>
          <View style={[styles.badge, { backgroundColor: cat.color + '22' }]}>
            <Text style={[styles.badgeText, { color: cat.color }]}>{cat.label}</Text>
          </View>
          {recipe.description ? (
            <Text style={[styles.heroDesc, { color: appleColors.gray2 }]}>{recipe.description}</Text>
          ) : null}
          {recipe.servings ? (
            <Text style={styles.servings}>분량 {recipe.servings}</Text>
          ) : null}
        </View>

        {/* Ingredients */}
        {recipe.ingredients.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: appleColors.gray2 }]}>재료</Text>
            {recipe.ingredients.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.ingredientRow,
                  idx < recipe.ingredients.length - 1 && { borderBottomWidth: 1, borderBottomColor: appleColors.gray5 },
                ]}
              >
                <Text style={[styles.ingredientName, { color: theme.colors.onSurface }]}>{item.name}</Text>
                <Text style={styles.ingredientQty}>{item.quantity}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Steps */}
        {recipe.steps.length > 0 && (
          <View style={styles.stepsSection}>
            <Text style={[styles.sectionTitle, { color: appleColors.gray2, marginBottom: 10 }]}>조리 단계</Text>
            {recipe.steps.map((step, idx) => (
              <View key={step.id} style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.stepNumWrap, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.stepNum}>{idx + 1}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={[styles.stepText, { color: theme.colors.onSurface }]}>{step.instruction}</Text>
                  <StepTimer step={step} recipeId={recipe.id} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {recipe.notes ? (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: appleColors.gray2 }]}>메모</Text>
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
  hero: { padding: 28, alignItems: 'center', gap: 10 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 26, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5, lineHeight: 32 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  heroDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginTop: 4 },
  servings: { fontSize: 13, color: appleColors.gray3, letterSpacing: -0.1 },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 6px rgba(0,0,0,0.05)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }
    ),
  },
  sectionTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, padding: 16, paddingBottom: 8 },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  ingredientName: { fontSize: 15, fontWeight: '400' },
  ingredientQty: { fontSize: 15, color: appleColors.gray2 },
  stepsSection: { marginHorizontal: 16, marginTop: 12, gap: 10 },
  stepCard: {
    borderRadius: 14,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 6px rgba(0,0,0,0.05)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }
    ),
  },
  stepNumWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#fff' },
  stepBody: { flex: 1, gap: 8 },
  stepText: { fontSize: 15, lineHeight: 22 },
  notes: { fontSize: 15, lineHeight: 22, padding: 16, paddingTop: 4 },
});
