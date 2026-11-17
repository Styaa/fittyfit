import { Chivo_600SemiBold, Chivo_700Bold, Chivo_800ExtraBold, Chivo_900Black } from '@expo-google-fonts/chivo';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider, useStore } from '@/store/store';
import { C } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.void, card: C.void, primary: C.primary, text: C.text, border: C.border } };

function Gate() {
  const { ready } = useStore();
  const [fontsLoaded, fontError] = useFonts({
    Chivo_600SemiBold,
    Chivo_700Bold,
    Chivo_800ExtraBold,
    Chivo_900Black,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });
  const loaded = ready && (fontsLoaded || !!fontError);
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.void }} />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.void }, animation: 'fade' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="session" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="growth" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="program" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="workout/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <StoreProvider>
          <StatusBar style="light" />
          <Gate />
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
