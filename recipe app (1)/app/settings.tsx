import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useSettingsStore } from '@/store/settingsStore';
import { appleColors } from '@/constants/theme';

export default function SettingsScreen() {
  const { anthropicApiKey, setAnthropicApiKey } = useSettingsStore();
  const [key, setKey] = useState(anthropicApiKey);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    setAnthropicApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <Text style={styles.groupLabel}>AI 레시피 추출</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Anthropic API 키</Text>
        <Text style={styles.cardDesc}>
          YouTube, 사진, 텍스트, 웹 URL에서 레시피를 자동 추출하는 데 사용됩니다.
          키는 이 기기에만 저장되며 외부로 전송되지 않습니다.
        </Text>

        <View style={styles.inputWrap}>
          <TextInput
            value={key}
            onChangeText={setKey}
            mode="outlined"
            secureTextEntry={!showKey}
            right={
              <TextInput.Icon
                icon={showKey ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowKey((v) => !v)}
                color={appleColors.gray3}
              />
            }
            placeholder="sk-ant-..."
            autoCapitalize="none"
            autoCorrect={false}
            outlineStyle={styles.inputOutline}
            placeholderTextColor={appleColors.gray4}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveBtn}
          labelStyle={{ fontSize: 14, fontWeight: '600' }}
        >
          {saved ? '저장됨 ✓' : '저장'}
        </Button>
      </View>

      <Text style={styles.hint}>
        API 키는 console.anthropic.com에서 발급받을 수 있습니다.
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
    marginBottom: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 8px rgba(0,0,0,0.08)' } as any
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appleColors.gray1,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: appleColors.gray2,
    lineHeight: 19,
    marginBottom: 16,
  },
  inputWrap: { marginBottom: 16 },
  inputOutline: { borderRadius: 10, borderColor: appleColors.gray4 },
  saveBtn: { alignSelf: 'flex-start', borderRadius: 20 },
  hint: {
    fontSize: 12,
    color: appleColors.gray3,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
});
