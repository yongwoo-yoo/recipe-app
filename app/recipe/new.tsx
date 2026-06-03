import React from 'react';
import { router } from 'expo-router';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import { useRecipeStore } from '@/store/recipeStore';
import type { RecipeFormData } from '@/types';

export default function NewRecipeScreen() {
  const addRecipe = useRecipeStore((s) => s.addRecipe);

  const handleSubmit = (data: RecipeFormData) => {
    addRecipe(data);
    router.back();
  };

  return <RecipeForm onSubmit={handleSubmit} submitLabel="레시피 저장" />;
}
