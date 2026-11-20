import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fmtClock } from '@/store/dates';
import { useStore } from '@/store/store';
import { C, F, glow, hexA } from '@/theme';

import { fmtKm, fmtPace } from '@/walk/geo';
import { useWalk, walkElapsed } from '@/walk/tracker';

import { Icon } from './ui';

/**
 * Pop-up melayang di atas layar selama istirahat antar set.
 * Tampil di semua halaman kecuali halaman sesi; ketuk untuk kembali ke rest phase.
 */
export function RestBanner() {
  const { state } = useStore();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const rest = state.restTimer;
  const visible = !!rest && !!state.active && pathname !== '/session';
  const [now, setNow] = useState(Date.now());
  const buzzed = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [visible]);

  const left = rest ? Math.max(0, (rest.endsAt - now) / 1000) : 0;
  const done = !!rest && left <= 0;

  // getar sekali saat istirahat selesai (ketika pengguna sedang di halaman lain)
  useEffect(() => {
    if (!visible || !rest || !done) return;
    if (buzzed.current === rest.endsAt) return;
    buzzed.current = rest.endsAt;
    if (state.settings.haptics && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [visible, done, rest, state.settings.haptics]);

  if (!visible || !rest) return null;
  const total = Math.max(1, (rest.endsAt - rest.startedAt) / 1000);
  const progress = done ? 1 : 1 - left / total;
  const color = done ? C.success : C.lavender;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 6 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={done ? 'Istirahat selesai, kembali ke sesi' : `Istirahat ${fmtClock(Math.ceil(left))}, kembali ke sesi`}
        onPress={() => router.push('/session')}
        style={({ pressed }) => [
          styles.pill,
          { borderColor: hexA(color, 0.55) },
          glow(done ? C.success : C.primary, 16, 0.45),
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        ]}>
        <View style={[styles.iconBox, { backgroundColor: hexA(color, 0.15) }]}>
          <Icon name={done ? 'check-bold' : 'timer-sand'} size={18} color={color} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[styles.title, { color }]}>
            {done ? 'REST SELESAI · SET SIAP' : 'REST PHASE'}
          </Text>
          <Text numberOfLines={1} style={styles.sub}>
            Set {rest.setIndex}/{rest.sets} · {rest.exerciseName}
          </Text>
        </View>
        <Text style={[styles.clock, { color }]}>{done ? 'GO' : fmtClock(Math.ceil(left))}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 1000, elevation: 1000, paddingHorizontal: 56 },
  pill: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 11,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#0e0b18',
    overflow: 'hidden',
  },
  iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.title, fontSize: 11, letterSpacing: 1.4 },
  sub: { fontFamily: F.bodySemi, color: C.text, fontSize: 12, marginTop: 1 },
  clock: { fontFamily: F.monoBold, fontSize: 20 },
  track: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: '#221d30' },
  fill: { height: '100%' },
});

/** Pop-up Mode Jalan: jarak & durasi berjalan, ketuk untuk kembali ke halaman Mode Jalan */
export function WalkBanner() {
  const { state } = useStore();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const walk = useWalk();
  const visible = walk.active && pathname !== '/walk';
  if (!visible) return null;
  // jika pop-up rest timer juga tampil, letakkan di bawahnya
  const restShown = !!state.restTimer && !!state.active && pathname !== '/session';
  const color = walk.paused ? C.gold : C.success;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 6 + (restShown ? 60 : 0) }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Mode Jalan ${fmtKm(walk.distanceM)} kilometer, kembali ke Mode Jalan`}
        onPress={() => router.push('/walk')}
        style={({ pressed }) => [styles.pill, { borderColor: hexA(color, 0.55) }, glow(color, 14, 0.35), pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }]}>
        <View style={[styles.iconBox, { backgroundColor: hexA(color, 0.15) }]}>
          <Icon name={walk.paused ? 'pause' : 'walk'} size={18} color={color} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[styles.title, { color }]}>
            {walk.paused ? 'MODE JALAN · DIJEDA' : 'MODE JALAN'}
          </Text>
          <Text numberOfLines={1} style={styles.sub}>
            {fmtClock(walkElapsed(walk))} · pace {fmtPace(walk.distanceM, walkElapsed(walk))}/km
          </Text>
        </View>
        <Text style={[styles.clock, { color }]}>{fmtKm(walk.distanceM)} km</Text>
      </Pressable>
    </View>
  );
}
