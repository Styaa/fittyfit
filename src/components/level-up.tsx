import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, Stop } from 'react-native-svg';

import { levelInfo, rankFor, totalXp } from '@/store/logic';
import { useStore } from '@/store/store';
import { C, F, glow, hexA, RANK_COLOR } from '@/theme';

import { Button, Label, ProgressBar } from './ui';

const LINES = [
  'Kekuatanmu bertambah, Hunter. System mencatat kemajuanmu.',
  'Batasmu telah dilampaui. Teruskan perburuan.',
  'Tubuhmu beradaptasi. Dungeon berikutnya menunggu.',
  'Disiplin berbuah kekuatan. Jangan berhenti sekarang.',
  'Satu langkah lebih dekat ke puncak. Tetap konsisten.',
];

const RANK_LINES: Record<string, string> = {
  D: 'Kamu bukan lagi pemula. Dungeon yang lebih berat kini terbuka.',
  C: 'Hunter kelas menengah. Banyak yang berhenti sebelum sampai di sini.',
  B: 'Kekuatanmu mulai diakui. Pertahankan ritmemu.',
  A: 'Elite. Hanya sedikit yang mencapai rank ini.',
  S: 'Puncak. System mengakui kekuatanmu.',
};

const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

/** Pop-up perayaan level up — muncul otomatis setiap kali level naik dari sumber apa pun */
export function LevelUpOverlay() {
  const { state, actions } = useStore();
  const lv = levelInfo(totalXp(state));
  const seen = state.seenLevel ?? lv.level;
  const visible = !!state.profile && lv.level > seen;

  const from = Math.max(1, seen);
  const rankBefore = rankFor(from);
  const rankNow = rankFor(lv.level);
  const rankUp = rankNow !== rankBefore;
  const gained = lv.level - from;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const line = useMemo(() => (rankUp ? RANK_LINES[rankNow] : LINES[lv.level % LINES.length]), [lv.level, rankUp, rankNow]);

  const pop = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const native = Platform.OS !== 'web';

  useEffect(() => {
    if (!visible) return;
    pop.setValue(0);
    burst.setValue(0);
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: native }),
      Animated.timing(burst, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
    ]).start();
    const loops = [
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: native })),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
          Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        ]),
      ),
    ];
    loops.forEach((l) => l.start());
    if (state.settings.haptics && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}), 350);
    }
    return () => loops.forEach((l) => l.stop());
  }, [visible, lv.level]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const accent = rankUp ? RANK_COLOR[rankNow] ?? C.lavender : C.lavender;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => actions.ackLevel(lv.level)} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity: pop, transform: [{ scale }] }, glow(C.primary, 30, 0.45)]}>
          {/* emblem: heksagon berputar + partikel */}
          <View style={styles.emblem}>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
              <View style={[styles.halo, { backgroundColor: hexA(accent, 0.22) }]} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
              <Svg width={180} height={180}>
                <Defs>
                  <LinearGradient id="lvEdge" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#E9DDFF" />
                    <Stop offset="1" stopColor={C.primary} />
                  </LinearGradient>
                </Defs>
                <Polygon points={hex(90, 90, 80)} fill="none" stroke="url(#lvEdge)" strokeWidth={4} />
                <Polygon points={hex(90, 90, 66)} fill="none" stroke={C.primary} strokeOpacity={0.45} strokeWidth={2} />
              </Svg>
            </Animated.View>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (Math.PI * 2 * i) / 12;
              const tx = burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * 118] });
              const ty = burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * 118] });
              const op = burst.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 0.6, 0] });
              return (
                <Animated.View
                  key={i}
                  style={[styles.spark, { backgroundColor: i % 3 === 0 ? C.success : accent, opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { rotate: '45deg' }] }]}
                />
              );
            })}
            <View style={styles.levelCenter}>
              <Text style={styles.lvSmall}>LV.</Text>
              <Text style={[styles.lvBig, { textShadowColor: hexA(accent, 0.8) }]}>{lv.level}</Text>
            </View>
          </View>

          <Label color={C.success} style={{ marginTop: 6 }}>
            [System] Notifikasi
          </Label>
          <Text style={styles.title}>LEVEL UP!</Text>
          <Text style={styles.fromTo}>
            LV. {from} → LV. {lv.level}
            {gained > 1 ? `  (+${gained} level)` : ''}
          </Text>

          {rankUp ? (
            <View style={[styles.rankBox, { borderColor: hexA(accent, 0.6), backgroundColor: hexA(accent, 0.1) }]}>
              <Text style={[styles.rankText, { color: accent }]}>RANK {rankNow} TERCAPAI</Text>
              <Text style={styles.rankSub}>
                Rank {rankBefore} → Rank {rankNow}
              </Text>
            </View>
          ) : null}

          <Text style={styles.line}>{line}</Text>

          <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Label>Menuju LV. {lv.level + 1}</Label>
              <Text style={styles.xp}>
                {lv.current}/{lv.needed} XP
              </Text>
            </View>
            <ProgressBar value={lv.current / lv.needed} height={6} />
          </View>

          <Button label="Lanjutkan" icon="arrow-right" size="lg" pill onPress={() => actions.ackLevel(lv.level)} style={{ alignSelf: 'stretch', marginTop: 22 }} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,3,12,0.88)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.borderStrong,
    backgroundColor: '#120e1f',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
  },
  emblem: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', left: 20, top: 20, width: 140, height: 140, borderRadius: 70 },
  spark: { position: 'absolute', width: 9, height: 9, borderRadius: 2 },
  levelCenter: { alignItems: 'center' },
  lvSmall: { fontFamily: F.mono, color: C.textDim, fontSize: 13, letterSpacing: 2 },
  lvBig: { fontFamily: F.display, color: '#f1ebff', fontSize: 64, lineHeight: 68, textShadowRadius: 18 },
  title: { fontFamily: F.display, color: C.lavenderSoft, fontSize: 40, letterSpacing: 2, marginTop: 2, textShadowColor: 'rgba(196,181,253,0.6)', textShadowRadius: 16 },
  fromTo: { fontFamily: F.monoBold, color: C.text, fontSize: 15, marginTop: 4 },
  rankBox: { alignSelf: 'stretch', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 10, marginTop: 14 },
  rankText: { fontFamily: F.headline, fontSize: 18, letterSpacing: 1.5 },
  rankSub: { fontFamily: F.mono, color: C.textDim, fontSize: 12, marginTop: 2 },
  line: { fontFamily: F.body, color: C.textMuted, fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 20 },
  xp: { fontFamily: F.mono, color: C.textMuted, fontSize: 12 },
});
