import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import { useRecipeStore } from '@/store/recipeStore';
import { appleColors } from '@/constants/theme';
import type { RecipeFormData } from '@/types';

export default function NewRecipeScreen() {
  const addRecipe = useRecipeStore((s) => s.addRecipe);

  const handleSubmit = (data: RecipeFormData) => {
    addRecipe(data);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '새 레시피',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>닫기</Text>
            </Pressable>
          ),
        }}
      />
      <RecipeForm onSubmit={handleSubmit} submitLabel="레시피 저장" />
    </>
  );
}

const styles = StyleSheet.create({
  closeBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  closeTxt: { fontSize: 16, color: appleColors.accent, fontWeight: '500' },
});
