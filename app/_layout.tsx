import { useEffect } from 'react';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTimer } from '@/hooks/useTimer';
import { lightTheme, appleColors } from '@/constants/theme';

function BackBtn() {
  return (
    <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
      <Text style={{ fontSize: 16, color: appleColors.accent, fontWeight: '500' }}>‹ 뒤로</Text>
    </Pressable>
  );
}

function CloseBtn() {
  return (
    <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
      <Text style={{ fontSize: 16, color: appleColors.accent, fontWeight: '500' }}>닫기</Text>
    </Pressable>
  );
}

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  useTimer();
  useEffect(() => { SplashScreen.hideAsync(); }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: appleColors.white } as any,
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        headerTintColor: appleColors.accent,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: appleColors.gray6 },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="recipe/new" options={{ title: '새 레시피', presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="recipe/[id]" options={{ title: '' }} />
      <Stack.Screen name="recipe/[id]/edit" options={{ title: '레시피 편집', headerLeft: () => <BackBtn /> }} />
      <Stack.Screen name="recipe/import" options={{ title: 'AI로 레시피 추가', presentation: 'modal', headerLeft: () => <CloseBtn /> }} />
      <Stack.Screen name="settings" options={{ title: '설정', headerLeft: () => <BackBtn /> }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={lightTheme}
        settings={{ icon: (props: any) => <MaterialCommunityIcons {...props} /> }}
      >
        <RootLayoutInner />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
