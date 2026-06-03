import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { PaperProvider, IconButton } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useTimer } from '@/hooks/useTimer';
import { lightTheme, darkTheme, appleColors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  useTimer();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        } as any,
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        headerTintColor: appleColors.blue,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: appleColors.gray6 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '레시피',
          headerRight: () => (
            <IconButton
              icon="cog-outline"
              size={22}
              iconColor={appleColors.blue}
              onPress={() => router.push('/settings')}
            />
          ),
        }}
      />
      <Stack.Screen name="recipe/new" options={{ title: '새 레시피', presentation: 'modal' }} />
      <Stack.Screen name="recipe/[id]" options={{ title: '' }} />
      <Stack.Screen name="recipe/[id]/edit" options={{ title: '레시피 편집' }} />
      <Stack.Screen name="recipe/import" options={{ title: 'AI로 레시피 추가', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: '설정' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <RootLayoutInner />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
