import React, { useMemo, useState } from 'react';
import {
  FlatList, View, StyleSheet, useWindowDimensions, Platform,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { useUIStore } from '@/store/uiStore';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { ImportContent } from '@/components/import/ImportContent';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import { appleColors } from '@/constants/theme';
import { CATEGORY_GROUP_MAP } from '@/constants/categories';
import type { RecipeFormData } from '@/types';

type ActiveModal = 'import' | 'new' | 'settings' | null;

// ── Header ────────────────────────────────────────────────────
interface HeaderProps {
  compact: boolean;
  onOpenImport: () => void;
  onOpenNew: () => void;
  onOpenSettings: () => void;
}

function AppHeader({ compact, onOpenImport, onOpenNew, onOpenSettings }: HeaderProps) {
  return (
    <View style={header.root}>
      <Pressable
        style={({ pressed }) => [header.logo, pressed && { opacity: 0.7 }]}
        onPress={() => router.push('/')}
      >
        <View style={header.logoIcon}>
          <Text style={header.logoEmoji}>🍳</Text>
        </View>
        {!compact && (
          <Text style={header.logoText}>
            오늘의<Text style={{ color: appleColors.accent }}>레시피</Text>
          </Text>
        )}
      </Pressable>

      <View style={header.actions}>
        <Pressable
          style={({ pressed }) => [header.btnAI, pressed && { opacity: 0.85 }]}
          onPress={onOpenImport}
        >
          <Text style={header.btnAIText}>{compact ? '✦ AI' : '✦  AI 추가'}</Text>
        </Pressable>

        {compact ? (
          <Pressable
            style={({ pressed }) => [header.iconBtn, pressed && { opacity: 0.8 }]}
            onPress={onOpenNew}
          >
            <Text style={header.iconBtnText}>+</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [header.btnNew, pressed && { opacity: 0.85 }]}
            onPress={onOpenNew}
          >
            <Text style={header.btnNewText}>+  새 레시피</Text>
          </Pressable>
        )}

        <IconButton
          icon="cog-outline"
          size={20}
          iconColor={appleColors.gray2}
          onPress={onOpenSettings}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: appleColors.gray5,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: appleColors.gray1,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 17 },
  logoText: { fontSize: 17, fontWeight: '700', color: appleColors.gray1, letterSpacing: -0.3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnAI: {
    backgroundColor: appleColors.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  btnAIText: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
  btnNew: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: appleColors.gray4,
    backgroundColor: 'transparent',
  },
  btnNewText: { fontSize: 13, fontWeight: '600', color: appleColors.gray1, letterSpacing: -0.1 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: appleColors.gray4,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18, fontWeight: '600', color: appleColors.gray1, lineHeight: 22 },
});

// ── Home Screen ───────────────────────────────────────────────
export default function HomeScreen() {
  const recipes = useRecipeStore((s) => s.recipes);
  const addRecipe = useRecipeStore((s) => s.addRecipe);
  const isLoaded = useRecipeStore((s) => s.isLoaded);
  const { activeGroup, activeCategoryId, searchQuery, setSearchQuery } = useUIStore();
  const { width } = useWindowDimensions();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const closeModal = () => setActiveModal(null);

  // 폰(<600): 1열 가로형 카드 / 그 이상: 다열 그리드
  const isPhone = width < 600;
  const CARD_TARGET = 200;
  const CARD_GAP = 12;
  const LIST_PAD = 28;
  const effectiveW = Math.min(width, 1200);
  const numColumns = isPhone
    ? 1
    : Math.min(4, Math.max(2, Math.floor((effectiveW - LIST_PAD + CARD_GAP) / (CARD_TARGET + CARD_GAP))));
  const cardW = isPhone
    ? effectiveW - LIST_PAD
    : Math.floor((effectiveW - LIST_PAD - CARD_GAP * numColumns) / numColumns);
  const listMaxWidth = Platform.OS === 'web' ? effectiveW : undefined;

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
          r.brewingTool?.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [recipes, activeGroup, activeCategoryId, searchQuery]);

  const groupLabel = activeGroup === 'cooking' ? '요리 레시피' : activeGroup === 'coffee' ? '커피 레시피' : '전체 레시피';

  const ListHeader = (
    <View style={listMaxWidth ? { maxWidth: listMaxWidth, width: '100%', alignSelf: 'center' } : undefined}>
      <View style={[styles.hero, isPhone && styles.heroPhone]}>
        <Text style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}>
          {isPhone ? '무엇을 만들까요?' : '무엇을 만들어\n볼까요?'}
        </Text>
        <Text style={styles.heroSub}>
          저장한 레시피 {recipes.length}개 · 요리부터 커피까지
        </Text>
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

      <CategoryFilter />

      {isLoaded && (
        <View style={[styles.sectionHeader, listMaxWidth ? { maxWidth: listMaxWidth, alignSelf: 'center', width: '100%' } : null]}>
          <Text style={styles.sectionTitle}>{groupLabel}</Text>
          <Text style={styles.sectionCount}>{filtered.length}개</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={appleColors.white} />
      <AppHeader
        compact={isPhone}
        onOpenImport={() => setActiveModal('import')}
        onOpenNew={() => setActiveModal('new')}
        onOpenSettings={() => setActiveModal('settings')}
      />
      <FlatList
        key={numColumns}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={isPhone
            ? { marginHorizontal: 14, marginVertical: 4 }
            : { width: cardW, margin: 6 }
          }>
            <RecipeCard recipe={item} horizontal={isPhone} />
          </View>
        )}
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'flex-start' } : undefined}
        contentContainerStyle={[
          styles.listContent,
          listMaxWidth ? { alignSelf: 'center', width: '100%', maxWidth: listMaxWidth } : null,
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

      <AppModal visible={activeModal === 'import'} title="✨ AI로 레시피 추가" onClose={closeModal}>
        <ImportContent onClose={closeModal} />
      </AppModal>

      <AppModal visible={activeModal === 'new'} title="새 레시피" onClose={closeModal}>
        <RecipeForm
          onSubmit={(data: RecipeFormData) => { addRecipe(data); closeModal(); }}
          submitLabel="레시피 저장"
        />
      </AppModal>

      <AppModal visible={activeModal === 'settings'} title="설정" onClose={closeModal}>
        <SettingsContent />
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: appleColors.gray6 },

  hero: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: appleColors.gray6,
    gap: 8,
  },
  heroPhone: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: appleColors.gray1,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  heroTitlePhone: {
    fontSize: 24,
    lineHeight: 30,
  },
  heroSub: {
    fontSize: 14,
    color: appleColors.gray2,
    letterSpacing: -0.1,
  },
  search: { backgroundColor: appleColors.white },
  searchOutline: { borderRadius: 14, borderColor: appleColors.gray4 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: appleColors.gray1, letterSpacing: -0.4 },
  sectionCount: { fontSize: 13, color: appleColors.gray3, fontWeight: '500' },

  listContent: { paddingBottom: 40 },
});
