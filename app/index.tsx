import React, { useMemo } from 'react';
import {
  FlatList, View, StyleSheet, useWindowDimensions, Platform,
  Pressable, SafeAreaView, StatusBar,
} from 'react-native';
import { TextInput, Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { useUIStore } from '@/store/uiStore';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import { appleColors } from '@/constants/theme';
import { CATEGORY_GROUP_MAP } from '@/constants/categories';

// ── Header ────────────────────────────────────────────────────
function AppHeader() {
  return (
    <View style={header.root}>
      {/* Logo */}
      <View style={header.logo}>
        <View style={header.logoIcon}>
          <Text style={header.logoEmoji}>🍳</Text>
        </View>
        <Text style={header.logoText}>
          오늘의<Text style={{ color: appleColors.accent }}>레시피</Text>
        </Text>
      </View>

      {/* Actions */}
      <View style={header.actions}>
        <Pressable
          style={({ pressed }) => [header.btnAI, pressed && { opacity: 0.85 }]}
          onPress={() => router.push('/recipe/import')}
        >
          <Text style={header.btnAIText}>✦  AI 추가</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [header.btnNew, pressed && { opacity: 0.85 }]}
          onPress={() => router.push('/recipe/new')}
        >
          <Text style={header.btnNewText}>+  새 레시피</Text>
        </Pressable>

        <IconButton
          icon="cog-outline"
          size={20}
          iconColor={appleColors.gray2}
          onPress={() => router.push('/settings')}
          style={{ margin: 0 }}
        />
      </View>
    </View>
  );
}

const header = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appleColors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: appleColors.gray5,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: appleColors.gray1,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 18 },
  logoText: { fontSize: 18, fontWeight: '700', color: appleColors.gray1, letterSpacing: -0.3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnAI: {
    backgroundColor: appleColors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnAIText: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
  btnNew: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: appleColors.gray4,
    backgroundColor: 'transparent',
  },
  btnNewText: { fontSize: 13, fontWeight: '600', color: appleColors.gray1, letterSpacing: -0.1 },
});

// ── Home Screen ───────────────────────────────────────────────
export default function HomeScreen() {
  const recipes = useRecipeStore((s) => s.recipes);
  const isLoaded = useRecipeStore((s) => s.isLoaded);
  const { activeGroup, activeCategoryId, searchQuery, setSearchQuery } = useUIStore();
  const { width } = useWindowDimensions();

  const numColumns = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const maxWidth = Platform.OS === 'web' ? Math.min(width, 1200) : undefined;

  const filtered = useMemo(() => {
    let result = recipes;
    if (activeGroup !== 'all') result = result.filter((r) => CATEGORY_GROUP_MAP[r.categoryId] === activeGroup);
    if (activeCategoryId !== 'all') result = result.filter((r) => r.categoryId === activeCategoryId);
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

  const groupLabel = activeGroup === 'cooking' ? '요리 레시피' : activeGroup === 'coffee' ? '커피 레시피' : '전체 레시피';

  const ListHeader = (
    <View style={maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : undefined}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>무엇을 만들어{'\n'}볼까요?</Text>
        <Text style={styles.heroSub}>
          저장한 레시피 {recipes.length}개 · 요리부터 커피까지
        </Text>
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="레시피, 재료 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={<TextInput.Icon icon="magnify" color={appleColors.gray3} size={20} />}
            right={searchQuery ? <TextInput.Icon icon="close-circle" size={18} onPress={() => setSearchQuery('')} color={appleColors.gray3} /> : null}
            mode="outlined"
            style={styles.search}
            outlineStyle={styles.searchOutline}
            contentStyle={{ fontSize: 15 }}
            placeholderTextColor={appleColors.gray3}
            dense
          />
        </View>
      </View>

      {/* Category filter */}
      <CategoryFilter />

      {/* Section header */}
      {isLoaded && (
        <View style={[styles.sectionHeader, maxWidth ? { maxWidth, alignSelf: 'center', width: '100%' } : null]}>
          <Text style={styles.sectionTitle}>{groupLabel}</Text>
          <Text style={styles.sectionCount}>{filtered.length}개</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={appleColors.white} />
      <AppHeader />
      <FlatList
        key={numColumns}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={[
          styles.listContent,
          maxWidth ? { alignSelf: 'center', width: '100%', maxWidth } : null,
        ]}
        ListEmptyComponent={
          isLoaded ? (
            <EmptyState
              title={searchQuery || activeCategoryId !== 'all' ? '검색 결과가 없습니다' : '아직 레시피가 없습니다'}
              description={
                searchQuery || activeCategoryId !== 'all'
                  ? '다른 검색어나 카테고리를 시도해보세요.'
                  : 'AI 추가나 새 레시피로 첫 레시피를 저장해보세요.'
              }
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: appleColors.gray6 },

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: appleColors.gray6,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: appleColors.gray1,
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: appleColors.gray2,
    marginBottom: 20,
    letterSpacing: -0.1,
  },
  searchWrap: {},
  search: { backgroundColor: appleColors.white },
  searchOutline: { borderRadius: 14, borderColor: appleColors.gray4 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appleColors.gray1,
    letterSpacing: -0.4,
  },
  sectionCount: {
    fontSize: 14,
    color: appleColors.gray3,
    fontWeight: '500',
  },

  // List
  listContent: { paddingHorizontal: 14, paddingBottom: 40 },
});
