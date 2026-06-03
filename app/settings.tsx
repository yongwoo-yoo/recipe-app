import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useSettingsStore } from '@/store/settingsStore';
import { appleColors } from '@/constants/theme';
import type { AIProvider } from '@/types';

const PROVIDERS: { id: AIProvider; label: string; placeholder: string; hint: string }[] = [
  {
    id: 'anthropic',
    label: 'Claude (Anthropic)',
    placeholder: 'sk-ant-...',
    hint: 'console.anthropic.com',
  },
  {
    id: 'gemini',
    label: 'Gemini (Google)',
    placeholder: 'AIza...',
    hint: 'aistudio.google.com',
  },
  {
    id: 'openai',
    label: 'ChatGPT (OpenAI)',
    placeholder: 'sk-...',
    hint: 'platform.openai.com',
  },
];

function ApiKeyRow({
  label,
  placeholder,
  hint,
  value,
  onSave,
}: {
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  onSave: (key: string) => void;
}) {
  const [text, setText] = useState(value);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(text.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={styles.keyRow}>
      <Text style={styles.keyLabel}>{label}</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        mode="outlined"
        secureTextEntry={!show}
        right={
          <TextInput.Icon
            icon={show ? 'eye-off-outline' : 'eye-outline'}
            onPress={() => setShow((v) => !v)}
            color={appleColors.gray3}
          />
        }
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        outlineStyle={styles.inputOutline}
        placeholderTextColor={appleColors.gray4}
        style={styles.input}
      />
      <View style={styles.keyFooter}>
        <Text style={styles.hintText}>{hint}</Text>
        <Button
          mode="contained"
          compact
          onPress={handleSave}
          style={styles.saveBtn}
          labelStyle={{ fontSize: 13, fontWeight: '600' }}
        >
          {saved ? '저장됨 ✓' : '저장'}
        </Button>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const store = useSettingsStore();

  const keyMap: Record<AIProvider, { value: string; onSave: (k: string) => void }> = {
    anthropic: { value: store.anthropicApiKey, onSave: store.setAnthropicApiKey },
    gemini:    { value: store.geminiApiKey,    onSave: store.setGeminiApiKey },
    openai:    { value: store.openaiApiKey,    onSave: store.setOpenaiApiKey },
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      {/* Provider selector */}
      <Text style={styles.groupLabel}>기본 AI 모델</Text>
      <View style={styles.card}>
        <Text style={styles.cardDesc}>AI로 레시피 추출 시 사용할 기본 모델을 선택하세요.</Text>
        <View style={styles.providerRow}>
          {PROVIDERS.map((p) => {
            const isActive = store.selectedProvider === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => store.setSelectedProvider(p.id)}
                style={[
                  styles.providerChip,
                  isActive && styles.providerChipActive,
                ]}
              >
                <Text style={[styles.providerLabel, isActive && styles.providerLabelActive]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* API key inputs */}
      <Text style={[styles.groupLabel, { marginTop: 24 }]}>API 키</Text>
      <View style={styles.card}>
        {PROVIDERS.map((p, idx) => (
          <View key={p.id}>
            {idx > 0 && <View style={styles.divider} />}
            <ApiKeyRow
              label={p.label}
              placeholder={p.placeholder}
              hint={p.hint}
              value={keyMap[p.id].value}
              onSave={keyMap[p.id].onSave}
            />
          </View>
        ))}
      </View>

      <Text style={styles.footerHint}>
        API 키는 이 기기에만 저장되며 외부로 전송되지 않습니다.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: appleColors.gray6 },
  container: { padding: 20, paddingTop: 24 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: appleColors.gray2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 8px rgba(0,0,0,0.08)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }),
  },
  cardDesc: { fontSize: 13, color: appleColors.gray2, lineHeight: 19, marginBottom: 14 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appleColors.gray4,
    backgroundColor: 'transparent',
  },
  providerChipActive: {
    backgroundColor: appleColors.gray1,
    borderColor: appleColors.gray1,
  },
  providerLabel: { fontSize: 13, fontWeight: '500', color: appleColors.gray2 },
  providerLabelActive: { color: '#ffffff' },
  divider: { height: 1, backgroundColor: appleColors.gray5, marginVertical: 16 },
  keyRow: { gap: 8 },
  keyLabel: { fontSize: 14, fontWeight: '600', color: appleColors.gray1 },
  inputOutline: { borderRadius: 10, borderColor: appleColors.gray4 },
  input: { backgroundColor: 'transparent' },
  keyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hintText: { fontSize: 12, color: appleColors.gray3 },
  saveBtn: { borderRadius: 16 },
  footerHint: {
    fontSize: 12,
    color: appleColors.gray3,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 16,
    paddingHorizontal: 8,
  },
});
