import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useSettingsStore } from '@/store/settingsStore';
import { appleColors } from '@/constants/theme';
import type { AIProvider } from '@/types';

// ── Provider 정보 ─────────────────────────────────────────────
const PROVIDERS: {
  id: AIProvider;
  label: string;
  subtitle: string;
  placeholder: string;
  hint: string;
  emoji: string;
  color: string;
}[] = [
  {
    id: 'anthropic',
    label: 'Claude',
    subtitle: 'Anthropic',
    placeholder: 'sk-ant-...',
    hint: 'console.anthropic.com',
    emoji: '🤖',
    color: '#D4692A',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    subtitle: 'Google AI Studio',
    placeholder: 'AIza...',
    hint: 'aistudio.google.com',
    emoji: '✦',
    color: '#4285F4',
  },
  {
    id: 'openai',
    label: 'ChatGPT',
    subtitle: 'OpenAI',
    placeholder: 'sk-...',
    hint: 'platform.openai.com',
    emoji: '⚡',
    color: '#10A37F',
  },
];

// ── API Key 입력 행 ────────────────────────────────────────────
function ApiKeyRow({
  placeholder, hint, value, onSave, hasKey,
}: {
  placeholder: string;
  hint: string;
  value: string;
  onSave: (key: string) => void;
  hasKey: boolean;
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
    <View style={row.wrap}>
      <View style={row.inputRow}>
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
              size={18}
            />
          }
          placeholder={placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          outlineStyle={row.outline}
          placeholderTextColor={appleColors.gray4}
          style={row.input}
          dense
        />
        <Button
          mode="contained"
          onPress={handleSave}
          style={row.btn}
          labelStyle={{ fontSize: 13, fontWeight: '700' }}
          compact
        >
          {saved ? '✓' : '저장'}
        </Button>
      </View>
      <View style={row.footer}>
        <Text style={row.hint}>{hint}</Text>
        {hasKey && <Text style={row.keyBadge}>키 등록됨</Text>}
      </View>
    </View>
  );
}

const row = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 14, gap: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  outline: { borderRadius: 10, borderColor: appleColors.gray4 },
  input: { flex: 1, backgroundColor: 'transparent' },
  btn: { borderRadius: 12, minWidth: 52 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { fontSize: 11, color: appleColors.gray3 },
  keyBadge: {
    fontSize: 11, fontWeight: '600',
    color: appleColors.green,
    backgroundColor: appleColors.green + '18',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
  },
});

// ── 메인 화면 ─────────────────────────────────────────────────
export default function SettingsScreen() {
  const store = useSettingsStore();

  const keyMap: Record<AIProvider, { value: string; onSave: (k: string) => void }> = {
    anthropic: { value: store.anthropicApiKey, onSave: store.setAnthropicApiKey },
    gemini:    { value: store.geminiApiKey,    onSave: store.setGeminiApiKey },
    openai:    { value: store.openaiApiKey,    onSave: store.setOpenaiApiKey },
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>

      {/* ── 기본 AI 모델 ── */}
      <Text style={styles.groupLabel}>기본 AI 모델</Text>
      <View style={styles.card}>
        {PROVIDERS.map((p, idx) => {
          const isActive = store.selectedProvider === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => store.setSelectedProvider(p.id)}
              style={({ pressed }) => [
                styles.providerRow,
                idx < PROVIDERS.length - 1 && styles.rowBorder,
                pressed && { backgroundColor: appleColors.gray6 },
              ]}
            >
              {/* 아이콘 */}
              <View style={[styles.providerIcon, { backgroundColor: p.color }]}>
                <Text style={styles.providerEmoji}>{p.emoji}</Text>
              </View>

              {/* 텍스트 */}
              <View style={styles.providerText}>
                <Text style={styles.providerLabel}>{p.label}</Text>
                <Text style={styles.providerSub}>{p.subtitle}</Text>
              </View>

              {/* 선택 표시 */}
              {isActive && (
                <View style={styles.checkWrap}>
                  <Text style={styles.check}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── API 키 ── */}
      <Text style={[styles.groupLabel, { marginTop: 28 }]}>API 키</Text>
      {PROVIDERS.map((p, idx) => (
        <View key={p.id} style={[styles.card, { marginBottom: 12 }]}>
          {/* 헤더 */}
          <View style={styles.apiCardHeader}>
            <View style={[styles.providerIcon, { backgroundColor: p.color }]}>
              <Text style={styles.providerEmoji}>{p.emoji}</Text>
            </View>
            <View>
              <Text style={styles.apiCardTitle}>{p.label}</Text>
              <Text style={styles.apiCardSub}>{p.subtitle}</Text>
            </View>
          </View>
          <View style={styles.apiCardDivider} />
          <ApiKeyRow
            placeholder={p.placeholder}
            hint={p.hint}
            value={keyMap[p.id].value}
            onSave={keyMap[p.id].onSave}
            hasKey={!!keyMap[p.id].value}
          />
        </View>
      ))}

      {/* ── 앱 정보 ── */}
      <Text style={[styles.groupLabel, { marginTop: 16 }]}>앱 정보</Text>
      <View style={styles.card}>
        <View style={[styles.infoRow, styles.rowBorder]}>
          <View style={[styles.providerIcon, { backgroundColor: appleColors.gray1 }]}>
            <Text style={styles.providerEmoji}>🍳</Text>
          </View>
          <Text style={styles.infoLabel}>오늘의레시피</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.providerIcon, { backgroundColor: '#5856D6' }]}>
            <Text style={styles.providerEmoji}>📦</Text>
          </View>
          <Text style={styles.infoLabel}>저장 방식</Text>
          <Text style={styles.infoValue}>로컬 전용</Text>
        </View>
      </View>

      <Text style={styles.footerHint}>
        API 키는 이 기기에만 저장되며 외부 서버로 전송되지 않습니다.
      </Text>
    </ScrollView>
  );
}

const card = {
  backgroundColor: appleColors.white,
  borderRadius: 16,
  overflow: 'hidden' as const,
  ...(Platform.OS === 'web'
    ? { boxShadow: '0 1px 8px rgba(34,31,26,0.07)' }
    : { shadowColor: '#221F1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 }),
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: appleColors.gray6 },
  container: { padding: 20, paddingTop: 24, paddingBottom: 48 },

  groupLabel: {
    fontSize: 11, fontWeight: '700',
    color: appleColors.gray2,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 8,
    paddingLeft: 4,
  },

  card: { ...card, marginBottom: 0 },

  // Provider selector rows
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: appleColors.gray5 },
  providerIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  providerEmoji: { fontSize: 18 },
  providerText: { flex: 1 },
  providerLabel: { fontSize: 15, fontWeight: '600', color: appleColors.gray1, letterSpacing: -0.2 },
  providerSub: { fontSize: 12, color: appleColors.gray3, marginTop: 1 },
  checkWrap: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: appleColors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  check: { fontSize: 13, color: '#fff', fontWeight: '700' },

  // API card
  apiCardHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 16, paddingBottom: 14,
  },
  apiCardTitle: { fontSize: 15, fontWeight: '700', color: appleColors.gray1 },
  apiCardSub: { fontSize: 12, color: appleColors.gray3, marginTop: 1 },
  apiCardDivider: { height: 1, backgroundColor: appleColors.gray5, marginHorizontal: 16 },

  // Info rows
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  infoLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: appleColors.gray1 },
  infoValue: { fontSize: 14, color: appleColors.gray3 },

  footerHint: {
    fontSize: 12, color: appleColors.gray3,
    textAlign: 'center', lineHeight: 17,
    marginTop: 20, paddingHorizontal: 8,
  },
});
