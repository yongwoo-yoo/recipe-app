import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSettingsStore } from '@/store/settingsStore';
import { useRecipeStore } from '@/store/recipeStore';
import { ImportMethodSheet, type ImportMethod } from '@/components/import/ImportMethodSheet';
import { extractRecipe } from '@/utils/aiExtract';
import { appleColors } from '@/constants/theme';
import { fetchYouTubeContent } from '@/utils/fetchYouTubeTranscript';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import type { RecipeFormData } from '@/types';

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ImportScreen() {
  const [method, setMethod] = useState<ImportMethod>('youtube');
  const [inputText, setInputText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<RecipeFormData | null>(null);

  const selectedProvider = useSettingsStore((s) => s.selectedProvider);
  const anthropicApiKey = useSettingsStore((s) => s.anthropicApiKey);
  const geminiApiKey = useSettingsStore((s) => s.geminiApiKey);
  const openaiApiKey = useSettingsStore((s) => s.openaiApiKey);
  const apiKey = selectedProvider === 'gemini' ? geminiApiKey : selectedProvider === 'openai' ? openaiApiKey : anthropicApiKey;
  const addRecipe = useRecipeStore((s) => s.addRecipe);

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
    if (!perm.granted) {
      setError('카메라 권한이 필요합니다.');
      return;
    }
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
      const providerName = selectedProvider === 'gemini' ? 'Gemini' : selectedProvider === 'openai' ? 'OpenAI' : 'Anthropic';
      setError(`설정에서 ${providerName} API 키를 먼저 입력해주세요.`);
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
        content = '';
      } else if (method === 'text') {
        if (!inputText.trim()) throw new Error('레시피 텍스트를 붙여넣어 주세요.');
        content = inputText.trim();
      } else if (method === 'url') {
        if (!inputText.trim()) throw new Error('URL을 입력해주세요.');
        let html = '';
        try {
          const res = await fetch(inputText.trim());
          html = await res.text();
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          const bodyContent = bodyMatch ? bodyMatch[1] : html;
          content = bodyContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
        } catch {
          content = `URL: ${inputText.trim()}\n(페이지를 직접 가져올 수 없었습니다. URL 정보만으로 추출 시도합니다.)`;
        }
      }

      const result = await extractRecipe(selectedProvider, apiKey, content, base64, mime);

      // Add IDs to ingredients and steps
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
    router.back();
  };

  if (extractedData) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.previewHeader}>
          <Text variant="bodyMedium" style={styles.previewDesc}>
            AI가 추출한 레시피를 확인하고 수정 후 저장하세요.
          </Text>
          <Button onPress={() => setExtractedData(null)}>다시 추출</Button>
        </View>
        <RecipeForm
          initialData={extractedData}
          onSubmit={handleSave}
          submitLabel="레시피 저장"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <Text variant="titleMedium" style={styles.sectionTitle}>방법 선택</Text>
          <Text style={styles.providerBadge}>
            {selectedProvider === 'gemini' ? 'Gemini' : selectedProvider === 'openai' ? 'ChatGPT' : 'Claude'}
          </Text>
        </View>
        <ImportMethodSheet selected={method} onSelect={(m) => { setMethod(m); setInputText(''); setImageUri(null); setImageBase64(null); }} />

        <Divider style={styles.divider} />

        {method === 'youtube' && (
          <TextInput
            label="YouTube URL"
            value={inputText}
            onChangeText={setInputText}
            mode="outlined"
            placeholder="https://www.youtube.com/watch?v=..."
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}

        {method === 'text' && (
          <TextInput
            label="레시피 텍스트 붙여넣기"
            value={inputText}
            onChangeText={setInputText}
            mode="outlined"
            multiline
            numberOfLines={8}
            placeholder="레시피 내용을 여기에 붙여넣어 주세요..."
          />
        )}

        {method === 'url' && (
          <TextInput
            label="레시피 페이지 URL"
            value={inputText}
            onChangeText={setInputText}
            mode="outlined"
            placeholder="https://..."
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}

        {method === 'image' && (
          <View style={styles.imageSection}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            ) : null}
            <View style={styles.imageButtons}>
              <Button icon="camera" mode="outlined" onPress={takePicture} style={{ flex: 1 }}>
                촬영
              </Button>
              <Button icon="image" mode="outlined" onPress={pickImage} style={{ flex: 1 }}>
                갤러리
              </Button>
            </View>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!apiKey && (
          <Text style={styles.warning}>
            AI 기능을 사용하려면 설정에서 API 키를 입력해주세요.
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleExtract}
          loading={isLoading}
          disabled={isLoading}
          icon="robot"
        >
          AI로 레시피 추출
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontWeight: '700' },
  providerBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: appleColors.blue,
    backgroundColor: appleColors.blue + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  divider: { marginVertical: 4 },
  imageSection: { gap: 10 },
  preview: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#f0f0f0' },
  imageButtons: { flexDirection: 'row', gap: 8 },
  error: { color: '#B00020', fontSize: 13 },
  warning: { color: '#E67E22', fontSize: 13, textAlign: 'center' },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  previewDesc: { flex: 1, opacity: 0.7 },
});
