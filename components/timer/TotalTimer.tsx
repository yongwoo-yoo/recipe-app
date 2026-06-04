import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { appleColors } from '@/constants/theme';
import { formatTime } from '@/utils/formatTime';

interface Props {
  onStart: (seconds: number) => void;
}

export function TotalTimer({ onStart }: Props) {
  const [configured, setConfigured] = useState(0);

  const add = (sec: number) => setConfigured((v) => Math.max(0, v + sec));

  const handleStart = () => {
    if (configured <= 0) return;
    onStart(configured);
    setConfigured(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>⏱ 전체 타이머</Text>

      {/* 현재 설정된 시간 */}
      <View style={styles.displayRow}>
        <Text style={[styles.display, configured === 0 && { color: appleColors.gray4 }]}>
          {configured === 0 ? '0:00' : formatTime(configured)}
        </Text>
        {configured > 0 && (
          <Pressable onPress={() => setConfigured(0)} style={styles.clearBtn} hitSlop={8}>
            <Text style={styles.clearTxt}>초기화</Text>
          </Pressable>
        )}
      </View>

      {/* 증감 버튼 */}
      <View style={styles.adjustRow}>
        {[
          { label: '분', delta: 60 },
          { label: '10초', delta: 10 },
          { label: '1초', delta: 1 },
        ].map(({ label, delta }) => (
          <View key={label} style={styles.adjGroup}>
            <Text style={styles.adjLabel}>{label}</Text>
            <View style={styles.adjBtnRow}>
              <Pressable style={styles.adjBtn} onPress={() => add(-delta)} hitSlop={8}>
                <Text style={styles.adjMinus}>−</Text>
              </Pressable>
              <Pressable style={[styles.adjBtn, styles.adjBtnPlus]} onPress={() => add(delta)} hitSlop={8}>
                <Text style={styles.adjPlus}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.startBtn, configured <= 0 && { opacity: 0.35 }]}
        disabled={configured <= 0}
        onPress={handleStart}
      >
        <Text style={styles.startTxt}>▶  시작</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 18, backgroundColor: appleColors.white,
    padding: 14, gap: 12,
    borderWidth: 1, borderColor: appleColors.gray5,
  },
  label: { fontSize: 13, fontWeight: '700', color: appleColors.gray2 },
  displayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  display: { fontSize: 36, fontWeight: '800', color: appleColors.gray1, letterSpacing: -1, fontVariant: ['tabular-nums'] as any },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: appleColors.gray5 },
  clearTxt: { fontSize: 12, fontWeight: '600', color: appleColors.gray2 },
  adjustRow: { flexDirection: 'row', gap: 8 },
  adjGroup: { flex: 1, alignItems: 'center', gap: 6 },
  adjLabel: { fontSize: 12, fontWeight: '700', color: appleColors.gray2 },
  adjBtnRow: { flexDirection: 'row', gap: 4 },
  adjBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: appleColors.gray5 },
  adjBtnPlus: { backgroundColor: appleColors.gray1 },
  adjMinus: { fontSize: 20, fontWeight: '500', color: appleColors.gray1, lineHeight: 22 },
  adjPlus: { fontSize: 20, fontWeight: '500', color: '#fff', lineHeight: 22 },
  startBtn: { backgroundColor: appleColors.gray1, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  startTxt: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
});
