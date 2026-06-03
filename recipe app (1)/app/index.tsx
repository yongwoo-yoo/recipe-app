import React, { useMemo } from 'react';
import { FlatList, View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { FAB, TextInput, useTheme, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { useUIStore } from '@/store/uiStore';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import { appleColors } from '@/constants/theme';
import { CATEGORY_GROUP_MAP } from '@/constants/categories';

export default function HomeScreen() {
  const recipes = useRecipeStore((s) => s.recipes);
  const isLoaded = useRecipeStore((s) => s.isLoaded);
  const { activeGroup, activeCategoryId, searchQuery, setSearchQuery } = useUIStore();
  const { width } = useWindowDimensions();
  const theme = useTheme();

  const numColumns = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const isWeb = Platform.OS === 'web';
  const maxWidth = isWeb ? Math.min(width, 1200) : undefined;

  const filtered = useMemo(() => {
    let result = recipes;
    // Group filter
    if (activeGroup !== 'all') {
      result = result.filter((r) => CATEGORY_GROUP_MAP[r.categoryId] === activeGroup);
    }
    // Category chip filter
    if (activeCategoryId !== 'all') {
      result = result.filter((r) => r.categoryId === activeCategoryId);
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [recipes, activeGroup, activeCategoryId, searchQuery]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Search + Filter bar */}
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface, borderBottomColor: appleColors.gray5 }]}>
        <View style={[styles.inner, maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : null]}>
          <TextInput
            placeholder="레시피, 재료 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={<TextInput.Icon icon="magnify" color={appleColors.gray3} />}
            right={searchQuery ? <TextInput.Icon icon="close-circle" onPress={() => setSearchQuery('')} color={appleColors.gray3} /> : null}
            mode="outlined"
            style={styles.search}
            outlineStyle={styles.searchOutline}
            contentStyle={{ fontSize: 15 }}
            placeholderTextColor={appleColors.gray3}
            dense
          />
        </View>
        <CategoryFilter />
      </View>

      {/* Recipe grid */}
      <FlatList
        key={numColumns}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={[
          filtered.length === 0 ? styles.emptyContainer : styles.list,
          maxWidth ? { alignSelf: 'center', width: '100%', maxWidth } : null,
        ]}
        ListEmptyComponent={
          isLoaded ? (
            <EmptyState
              title={searchQuery || activeCategoryId !== 'all' ? '검색 결과가 없습니다' : '레시피가 없습니다'}
              description={
                searchQuery || activeCategoryId !== 'all'
                  ? '다른 검색어나 카테고리를 시도해보세요.'
                  : '+ 버튼이나 AI로 첫 레시피를 추가해보세요.'
              }
            />
          ) : null
        }
      />

      {/* FABs */}
      <View style={styles.fabContainer}>
        <FAB
          icon="robot-outline"
          label="AI로 추가"
          style={[styles.fabExtended, { backgroundColor: appleColors.gray1 }]}
          color="#fff"
          onPress={() => router.push('/recipe/import')}
        />
        <FAB
          icon="plus"
          label="레시피 추가"
          style={[styles.fabExtended, { backgroundColor: theme.colors.primary }]}
          color="#fff"
          onPress={() => router.push('/recipe/new')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    borderBottomWidth: 1,
    paddingBottom: 0,
  },
  inner: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  search: { backgroundColor: 'transparent' },
  searchOutline: { borderRadius: 10, borderColor: appleColors.gray4 },
  list: { padding: 16, paddingBottom: 120 },
  emptyContainer: { flex: 1 },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'flex-end',
    gap: 10,
  },
  fabExtended: { borderRadius: 16 },
});
