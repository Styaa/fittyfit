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
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setLockConfig } from '@modules/shadow-lock';

import { LevelUpOverlay } from '@/components/level-up';
import { RestBanner, WalkBanner } from '@/components/rest-banner';
import { cancelRestDone, configureNotifications, scheduleRestDone, syncNotifications } from '@/notify/notify';
import { dayKey } from '@/store/dates';
import { lockDays, unlockedDates } from '@/store/lock';
import { StoreProvider, useStore } from '@/store/store';
// memuat task latar Mode Jalan (harus didefinisikan saat aplikasi start)
import '@/walk/tracker';
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

  // timer istirahat global: notifikasi "Rest selesai" tetap terjadwal walau pindah halaman
  const rest = state.restTimer;
  useEffect(() => {
    const st = ref.current;
    if (rest && !st.active) {
      actions.clearRest();
      return;
    }
    if (rest) scheduleRestDone(rest.endsAt, rest.exerciseName, rest.setIndex, st.settings.notif.enabled && st.settings.notif.restTimer);
    else cancelRestDone();
  }, [rest?.endsAt, rest?.exerciseId, !!state.active]); // eslint-disable-line react-hooks/exhaustive-deps

  // konfigurasi lockdown → modul native (langsung, tanpa jeda, agar kunci segera terbuka setelah latihan)
  const lockSig = JSON.stringify([
    !!state.profile && state.settings.lock.enabled,
    state.settings.lock.hour,
    state.settings.lock.minute,
    lockDays(state),
    unlockedDates(state),
  ]);
  useEffect(() => {
    const st = ref.current;
    setLockConfig({
      enabled: !!st.profile && st.settings.lock.enabled,
      hour: st.settings.lock.hour,
      minute: st.settings.lock.minute,
      days: lockDays(st),
      unlocked: unlockedDates(st),
    });
  }, [lockSig]);

  const signature = JSON.stringify([
    !!state.profile,
    state.sessions.length,
    state.penalty,
    state.passDays,
    state.quests,
    state.settings.notif,
    state.settings.lock,
    state.emergencyUnlocks,
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
        <Stack.Screen name="lock" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="walk" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="walks/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="walks/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <RestBanner />
      <WalkBanner />
      <LevelUpOverlay />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
      <ThemeProvider value={theme}>
        <StoreProvider>
          <StatusBar style="light" />
          <Gate />
        </StoreProvider>
      </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
