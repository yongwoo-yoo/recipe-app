import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { TextInput, Button, Text, Menu, Divider } from 'react-native-paper';
import { CATEGORIES, BREW_TOOLS } from '@/constants/categories';
import { appleColors } from '@/constants/theme';
import { IngredientList } from './IngredientList';
import { StepList } from './StepList';
import type { RecipeFormData, CategoryId, Ingredient, RecipeStep } from '@/types';

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const DEFAULT_FORM: RecipeFormData = {
  title: '',
  categoryId: 'other',
  description: '',
  servings: '',
  ingredients: [],
  steps: [],
  notes: '',
  brewingTool: undefined,
};

interface Props {
  initialData?: Partial<RecipeFormData>;
  onSubmit: (data: RecipeFormData) => void;
  submitLabel?: string;
  isLoading?: boolean;
  extraBottom?: React.ReactNode;
}

export function RecipeForm({ initialData, onSubmit, submitLabel = '저장', isLoading, extraBottom }: Props) {
  const [form, setForm] = useState<RecipeFormData>({
    ...DEFAULT_FORM,
    ...initialData,
    ingredients: (initialData?.ingredients ?? []).map((i) => ({ ...i, id: i.id || genId() })),
    steps: (initialData?.steps ?? []).map((s) => ({ ...s, id: s.id || genId() })),
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const set = (patch: Partial<RecipeFormData>) => setForm((f) => ({ ...f, ...patch }));

  const validate = (): boolean => {
    if (!form.title.trim()) {
      setErrors({ title: '레시피 이름을 입력해주세요.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form);
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === form.categoryId);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          label="레시피 이름 *"
          value={form.title}
          onChangeText={(v) => set({ title: v })}
          mode="outlined"
          error={!!errors.title}
        />
        {errors.title && <Text style={styles.error}>{errors.title}</Text>}

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              contentStyle={styles.categoryBtnContent}
            >
              {selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.label}` : '카테고리 선택'}
            </Button>
          }
        >
          {CATEGORIES.map((cat) => (
            <Menu.Item
              key={cat.id}
              title={`${cat.emoji} ${cat.label}`}
              onPress={() => { set({ categoryId: cat.id }); setMenuVisible(false); }}
            />
          ))}
        </Menu>

        {/* ── 브루잉 도구 (핸드드립 전용) ── */}
        {form.categoryId === 'hand-drip' && (
          <View style={styles.brewSection}>
            <Text style={styles.brewLabel}>브루잉 도구</Text>
            <View style={styles.brewChips}>
              {BREW_TOOLS.map((tool) => {
                const isActive = form.brewingTool === tool;
                return (
                  <Pressable
                    key={tool}
                    onPress={() => set({ brewingTool: isActive ? undefined : tool })}
                    style={[styles.brewChip, isActive && styles.brewChipActive]}
                  >
                    <Text style={[styles.brewChipText, isActive && styles.brewChipTextActive]}>
                      {tool}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              label="직접 입력 (선택)"
              value={form.brewingTool ?? ''}
              onChangeText={(v) => set({ brewingTool: v || undefined })}
              mode="outlined"
              placeholder="예: 고노, 오리가미…"
              dense
            />
          </View>
        )}

        <TextInput
          label="설명 (선택)"
          value={form.description}
          onChangeText={(v) => set({ description: v })}
          multiline
          numberOfLines={2}
          mode="outlined"
        />

        <TextInput
          label="인분 / 분량 (선택)"
          value={form.servings}
          onChangeText={(v) => set({ servings: v })}
          mode="outlined"
          placeholder="예: 2인분, 200ml"
        />

        <Divider style={styles.divider} />

        <IngredientList
          ingredients={form.ingredients}
          onChange={(ingredients: Ingredient[]) => set({ ingredients })}
        />

        <Divider style={styles.divider} />

        <StepList
          steps={form.steps}
          onChange={(steps: RecipeStep[]) => set({ steps })}
        />

        <Divider style={styles.divider} />

        <TextInput
          label="메모 (선택)"
          value={form.notes}
          onChangeText={(v) => set({ notes: v })}
          multiline
          numberOfLines={3}
          mode="outlined"
        />

        {extraBottom}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitBtn}
        >
          {submitLabel}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  categoryBtnContent: { justifyContent: 'flex-start' },
  divider: { marginVertical: 8 },
  error: { color: '#B00020', fontSize: 12, marginTop: -8 },
  submitBtn: { marginTop: 8 },

  brewSection: {
    backgroundColor: appleColors.surface2,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: appleColors.gray5,
  },
  brewLabel: {
    fontSize: 12, fontWeight: '700',
    color: appleColors.gray2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  brewChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  brewChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: appleColors.gray4,
    backgroundColor: appleColors.white,
  },
  brewChipActive: {
    backgroundColor: appleColors.gray1,
    borderColor: appleColors.gray1,
  },
  brewChipText: { fontSize: 13, fontWeight: '600', color: appleColors.gray2 },
  brewChipTextActive: { color: '#fff' },
});
