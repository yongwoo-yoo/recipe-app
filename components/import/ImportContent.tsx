import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Image, Pressable } from 'react-native';
import { Text, TextInput, ActivityIndicator, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSettingsStore } from '@/store/settingsStore';
import { useRecipeStore } from '@/store/recipeStore';
import { ImportMethodSheet, type ImportMethod } from '@/components/import/ImportMethodSheet';
import { extractRecipe } from '@/utils/aiExtract';
import { appleColors } from '@/constants/theme';
import { fetchYouTubeContent } from '@/utils/fetchYouTubeTranscript';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import type { RecipeFormData } from '@/types';

const SAMPLE_TEXT = `김치볶음밥

재료: 찬밥 2공기, 잘 익은 김치 1컵, 스팸 1/2캔, 대파 1대, 계란 2개, 고춧가루 1작은술, 간장 1큰술, 참기름 1큰술, 식용유

만드는 법:
1. 김치와 스팸, 대파를 잘게 썬다.
2. 팬에 식용유를 두르고 스팸을 노릇하게 볶는다.
3. 김치를 넣고 3분간 볶다가 고춧가루를 넣는다.
4. 찬밥을 넣고 간장으로 간하며 잘 섞어 볶는다.
5. 그릇에 담고 계란프라이를 올린 뒤 참기름을 두른다.`;

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface Props {
  onClose: () => void;
}

export function ImportContent({ onClose }: Props) {
  const [method, setMethod] = useState<ImportMethod>('text');
  const [inputText, setInputText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<RecipeFormData | null>(null);

  const selectedProvider = useSettingsStore((s) => s.selectedProvider ?? 'anthropic');
  const anthropicApiKey = useSettingsStore((s) => s.anthropicApiKey ?? '');
  const geminiApiKey = useSettingsStore((s) => s.geminiApiKey ?? '');
  const openaiApiKey = useSettingsStore((s) => s.openaiApiKey ?? '');
  const apiKey =
    selectedProvider === 'gemini' ? geminiApiKey
    : selectedProvider === 'openai' ? openaiApiKey
    : anthropicApiKey;

  const addRecipe = useRecipeStore((s) => s.addRecipe);

  const providerLabel =
    selectedProvider === 'gemini' ? 'Gemini'
    : selectedProvider === 'openai' ? 'ChatGPT'
    : 'Claude';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 ?? null);
      const ext = asset.uri.split('.').pop()?.toLowerCase();
      setImageMime(ext === 'png' ? 'image/png' : 'image/jpeg');
    }
  };

  const takePicture = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { setError('카메라 권한이 필요합니다.'); return; }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 ?? null);
      setImageMime('image/jpeg');
    }
  };

  const handleExtract = async () => {
    if (!apiKey) {
      setError(`설정에서 ${providerLabel} API 키를 먼저 저장해주세요.`);
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      let content = '';
      let base64: string | undefined;
      let mime: string | undefined;

      if (method === 'youtube') {
        if (!inputText.trim()) throw new Error('YouTube URL을 입력해주세요.');
        content = await fetchYouTubeContent(inputText.trim());
      } else if (method === 'image') {
        if (!imageBase64) throw new Error('사진을 선택해주세요.');
        base64 = imageBase64;
        mime = imageMime;
      } else if (method === 'text') {
        if (!inputText.trim()) throw new Error('레시피 텍스트를 붙여넣어 주세요.');
        content = inputText.trim();
      } else if (method === 'url') {
        if (!inputText.trim()) throw new Error('URL을 입력해주세요.');
        try {
          const res = await fetch(inputText.trim());
          const html = await res.text();
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          const bodyContent = bodyMatch ? bodyMatch[1] : html;
          content = bodyContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
        } catch {
          content = `URL: ${inputText.trim()}\n(페이지를 직접 가져올 수 없었습니다.)`;
        }
      }

      const result = await extractRecipe(selectedProvider, apiKey, content, base64, mime);
      result.ingredients = result.ingredients.map((i) => ({ ...i, id: i.id || genId() }));
      result.steps = result.steps.map((s) => ({ ...s, id: s.id || genId() }));
      setExtractedData(result);
    } catch (e: any) {
      setError(e.message ?? '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (data: RecipeFormData) => {
    addRecipe(data);
    onClose();
  };

  // ── 추출 결과 화면 ──────────────────────────────────────────
  if (extractedData) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.previewBanner}>
          <Text style={styles.previewBannerText}>AI가 추출한 레시피를 확인하고 수정 후 저장하세요.</Text>
          <Button compact onPress={() => setExtractedData(null)}>다시 추출</Button>
        </View>
        <RecipeForm
          initialData={extractedData}
          onSubmit={handleSave}
          submitLabel="레시피 저장"
        />
      </View>
    );
  }

  // ── 입력 화면 ───────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Provider badge */}
      <View style={styles.providerRow}>
        <Text style={styles.fieldLabel}>불러올 방법</Text>
        <Text style={styles.providerBadge}>{providerLabel}</Text>
      </View>

      {/* Method selector */}
      <ImportMethodSheet
        selected={method}
        onSelect={(m) => { setMethod(m); setInputText(''); setImageUri(null); setImageBase64(null); }}
      />

      {/* Input area */}
      <View style={styles.inputSection}>
        {method === 'text' && (
          <>
            <View style={styles.inputLabelRow}>
              <Text style={styles.fieldLabel}>내용 붙여넣기</Text>
              <Pressable onPress={() => setInputText(SAMPLE_TEXT)}>
                <Text style={styles.sampleBtn}>예시 채우기</Text>
              </Pressable>
            </View>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              mode="outlined"
              multiline
              numberOfLines={8}
              placeholder="레시피 내용을 여기에 붙여넣어 주세요…"
              outlineStyle={styles.inputOutline}
              style={styles.textarea}
            />
          </>
        )}
        {method === 'youtube' && (
          <>
            <Text style={styles.fieldLabel}>YouTube URL</Text>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              mode="outlined"
              placeholder="https://www.youtube.com/watch?v=..."
              autoCapitalize="none"
              autoCorrect={false}
              outlineStyle={styles.inputOutline}
            />
          </>
        )}
        {method === 'url' && (
          <>
            <Text style={styles.fieldLabel}>레시피 페이지 URL</Text>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              mode="outlined"
              placeholder="https://..."
              autoCapitalize="none"
              autoCorrect={false}
              outlineStyle={styles.inputOutline}
            />
          </>
        )}
        {method === 'image' && (
          <>
            <Text style={styles.fieldLabel}>레시피 사진</Text>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            )}
            <View style={styles.imageButtons}>
              <Button icon="camera" mode="outlined" onPress={takePicture} style={{ flex: 1 }}>촬영</Button>
              <Button icon="image" mode="outlined" onPress={pickImage} style={{ flex: 1 }}>갤러리</Button>
            </View>
          </>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!apiKey && !error && (
        <Text style={styles.warning}>
          설정에서 {providerLabel} API 키를 먼저 저장해주세요.
        </Text>
      )}

      {/* AI gradient button */}
      <Pressable
        onPress={handleExtract}
        disabled={isLoading}
        style={({ pressed }) => [styles.aiBtnWrap, pressed && { opacity: 0.88 }]}
      >
        <LinearGradient
          colors={['#E2574C', '#D9683F', '#E0A02E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.aiBtn}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" size={18} />
            : <Text style={styles.aiBtnText}>✦  AI로 레시피 추출</Text>
          }
        </LinearGradient>
      </Pressable>

      <Text style={styles.hint}>붙여넣은 내용을 분석해 제목·재료·단계·타이머를 자동으로 정리해요.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 20, gap: 14, paddingBottom: 32 },

  providerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 12.5, fontWeight: '600', color: appleColors.gray2, letterSpacing: -0.1 },
  providerBadge: {
    fontSize: 11, fontWeight: '600',
    color: appleColors.accent,
    backgroundColor: appleColors.accent + '18',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8,
  },

  inputSection: { gap: 8 },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sampleBtn: { fontSize: 12.5, fontWeight: '600', color: appleColors.accent },
  inputOutline: { borderRadius: 12, borderColor: appleColors.gray4 },
  textarea: { minHeight: 160, backgroundColor: appleColors.white },

  imageButtons: { flexDirection: 'row', gap: 8 },
  preview: { width: '100%', height: 180, borderRadius: 12, backgroundColor: appleColors.gray5 },

  error: { color: appleColors.red, fontSize: 13 },
  warning: { color: appleColors.orange, fontSize: 13, textAlign: 'center' },

  aiBtnWrap: { borderRadius: 15, overflow: 'hidden' },
  aiBtn: {
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 6px 18px rgba(217,104,63,0.32)' } as any : {
      shadowColor: '#D9683F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.32,
      shadowRadius: 10,
      elevation: 5,
    }),
  },
  aiBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  hint: { fontSize: 12, color: appleColors.gray3, textAlign: 'center', lineHeight: 18 },

  previewBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderBottomWidth: 1, borderBottomColor: appleColors.gray5,
  },
  previewBannerText: { flex: 1, fontSize: 13, color: appleColors.gray2, opacity: 0.9 },
});
