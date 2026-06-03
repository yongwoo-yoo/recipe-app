import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import type { RecipeFormData } from '@/types';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getRecipeById = useRecipeStore((s) => s.getRecipeById);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);
  const recipe = getRecipeById(id);

  const handleSubmit = (data: RecipeFormData) => {
    updateRecipe(id, data);
    router.back();
  };

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

  if (!recipe) return null;

  return (
    <RecipeForm
      initialData={recipe}
      onSubmit={handleSubmit}
      submitLabel="저장"
      extraBottom={
        <Button
          mode="outlined"
          textColor="#B00020"
          onPress={handleDelete}
          style={{ borderColor: '#B00020', marginTop: 8 }}
        >
          레시피 삭제
        </Button>
      }
    />
  );
}
