export type CategoryId =
  | 'korean'
  | 'western'
  | 'japanese'
  | 'chinese'
  | 'dessert'
  | 'espresso'
  | 'hand-drip'
  | 'cold-brew'
  | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export interface TimerConfig {
  durationSeconds: number;
  label?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

export interface RecipeStep {
  id: string;
  instruction: string;
  timer?: TimerConfig;
}

export interface RecipeHistoryEntry {
  id: string;
  date: string;       // ISO string
  note: string;       // 자유 텍스트 (원두, 그라인더, 클릭수, 결과 등)
}

export interface Recipe {
  id: string;
  title: string;
  categoryId: CategoryId;
  description?: string;
  source?: string;
  servings?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  notes?: string;
  imageUri?: string;
  brewingTool?: string;
  history?: RecipeHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFormData {
  title: string;
  categoryId: CategoryId;
  description: string;
  source?: string;
  servings: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  notes: string;
  brewingTool?: string;
}

export interface RecipeState {
  recipes: Recipe[];
  isLoaded: boolean;
  addRecipe: (data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecipe: (id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => void;
  deleteRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  addHistoryEntry: (recipeId: string, note: string) => void;
  deleteHistoryEntry: (recipeId: string, entryId: string) => void;
}

export interface TimerState {
  activeStepId: string | null;
  recipeId: string | null;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  startTimer: (stepId: string, recipeId: string, durationSeconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
}

export interface UIState {
  activeCategoryId: CategoryId | 'all';
  searchQuery: string;
  setActiveCategory: (id: CategoryId | 'all') => void;
  setSearchQuery: (q: string) => void;
}

export type AIProvider = 'anthropic' | 'gemini' | 'openai';

export interface SettingsState {
  selectedProvider: AIProvider;
  anthropicApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  setSelectedProvider: (p: AIProvider) => void;
  setAnthropicApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setOpenaiApiKey: (key: string) => void;
}
