import React from 'react';
import { Modal, View, Pressable, Platform, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Text } from 'react-native-paper';
import { appleColors } from '@/constants/theme';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function AppModal({ visible, title, onClose, children }: Props) {
  const isWeb = Platform.OS === 'web';
  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? 'fade' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <View style={[styles.backdrop, !isWeb && styles.backdropMobile]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, !isWeb && styles.sheetMobile]}>
          {/* drag handle (mobile) */}
          {!isWeb && <View style={styles.handle} />}

          {/* header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.body}>
            {children}
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,10,4,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropMobile: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: appleColors.white,
    borderRadius: 20,
    width: '90%',
    maxWidth: 660,
    height: '85%',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 24px 80px rgba(0,0,0,0.22)' } as any)
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.14,
          shadowRadius: 20,
          elevation: 16,
        }),
  },
  sheetMobile: {
    width: '100%',
    maxWidth: undefined as any,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: appleColors.gray4,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: appleColors.gray5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: appleColors.gray1,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appleColors.gray5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 12,
    color: appleColors.gray2,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
});
