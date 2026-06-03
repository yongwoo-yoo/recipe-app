import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useTimer } from '@/hooks/useTimer';
import { lightTheme, appleColors } from '@/constants/theme';

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
      <Stack.Screen name="recipe/new" options={{ title: '새 레시피', presentation: 'modal' }} />
      <Stack.Screen name="recipe/[id]" options={{ title: '' }} />
      <Stack.Screen name="recipe/[id]/edit" options={{ title: '레시피 편집' }} />
      <Stack.Screen name="recipe/import" options={{ title: 'AI로 레시피 추가', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: '설정' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <RootLayoutInner />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
