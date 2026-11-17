import { Chivo_600SemiBold, Chivo_700Bold, Chivo_800ExtraBold, Chivo_900Black } from '@expo-google-fonts/chivo';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState as RNAppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureNotifications, syncNotifications } from '@/notify/notify';
import { dayKey } from '@/store/dates';
import { StoreProvider, useStore } from '@/store/store';
import { C } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.void, card: C.void, primary: C.primary, text: C.text, border: C.border } };

/** Evaluasi penalti harian + sinkronisasi notifikasi di latar */
function Daemon() {
  const { state, actions } = useStore();
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    configureNotifications();
    actions.evaluate();
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') actions.evaluate();
    });
    const t = setInterval(() => actions.evaluate(), 60_000);
    return () => {
      sub.remove();
      clearInterval(t);
    };
  }, [actions]);

  const signature = JSON.stringify([
    !!state.profile,
    state.sessions.length,
    state.penalty,
    state.passDays,
    state.quests,
    state.settings.notif,
    state.workouts.map((w) => [w.id, w.day, w.name, w.subtitle]),
    state.program,
    dayKey(),
  ]);
  useEffect(() => {
    const t = setTimeout(() => syncNotifications(ref.current), 1500);
    return () => clearTimeout(t);
  }, [signature]);
  return null;
}

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
    <>
      <Daemon />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.void }, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="session" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="growth" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="program" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="workout/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="penalty" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </>
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
