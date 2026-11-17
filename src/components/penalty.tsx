import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { dayKey, fmtClock } from '@/store/dates';
import { isTrainingDay, passesUsedThisMonth, REST_PASS_MONTHLY_LIMIT, REST_PASS_PRICE, restPassBlock } from '@/store/penalty';
import { useStore } from '@/store/store';
import { C, F, glow, hexA } from '@/theme';

import { Body, Icon, Label, Mono } from './ui';

/** detik tersisa sampai 23:59:59 hari ini */
export function useMidnightCountdown() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return Math.max(0, (end.getTime() - now.getTime()) / 1000);
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

/** Kartu merah Penalty Quest (tampil di Status & Quests) */
export function PenaltyCard() {
  const { state } = useStore();
  const p = state.penalty;
  const left = useMidnightCountdown();
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 700);
    return () => clearInterval(t);
  }, []);
  if (!p) return null;
  if (p.status === 'cleared')
    return (
      <View style={[styles.card, styles.cleared]}>
        <Icon name="shield-check-outline" size={22} color={C.success} />
        <View style={{ flex: 1 }}>
          <Label color={C.success}>Penalty cleared</Label>
          <Body size={13} color={C.text}>
            Streak dipulihkan. Lanjutkan dungeon hari ini.
          </Body>
        </View>
      </View>
    );
  return (
    <Pressable onPress={() => router.push('/penalty')} style={({ pressed }) => [styles.card, glow(C.danger, 16, 0.3), pressed && { opacity: 0.85 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name="alert-octagon-outline" size={24} color={C.danger} style={{ opacity: blink ? 1 : 0.45 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>⚠ PENALTY QUEST</Text>
          <Body size={12} color={C.textMuted}>
            Dungeon terlewat: {p.workoutName}
          </Body>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Label color={C.danger}>Batas</Label>
          <Mono color="#fca5a5" size={16}>
            {fmtClock(left)}
          </Mono>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 6 }}>
        <Label color={C.textMuted}>
          Ronde {p.roundsDone}/{p.rounds}
        </Label>
        <Label color={C.danger}>Kerjakan →</Label>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(p.roundsDone / p.rounds) * 100}%` }]} />
      </View>
    </Pressable>
  );
}

/** Pesan System (penalti baru / gagal / selesai) */
export function SystemNotice() {
  const { state, actions } = useStore();
  const n = state.notice;
  if (!n) return null;
  const color = n.kind === 'penalty-cleared' ? C.success : C.danger;
  return (
    <View style={[styles.notice, { borderColor: hexA(color, 0.45) }]}>
      <Icon name={n.kind === 'penalty-cleared' ? 'check-decagram' : 'alert-outline'} size={20} color={color} />
      <View style={{ flex: 1 }}>
        <Label color={color}>[System]</Label>
        <Body size={13} color={C.text}>
          {n.text}
        </Body>
      </View>
      <Pressable onPress={actions.dismissNotice} hitSlop={10}>
        <Icon name="close" size={18} color={C.textDim} />
      </Pressable>
    </View>
  );
}

/** Tag debuff Weakened */
export function DebuffTag() {
  const { state } = useStore();
  const n = state.debuffSessions ?? 0;
  if (n <= 0) return null;
  return (
    <View style={styles.debuff}>
      <Icon name="arrow-down-bold-circle-outline" size={16} color={C.danger} />
      <Text style={styles.debuffText}>WEAKENED · XP −25% · {n} sesi lagi</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: hexA(C.danger, 0.55), backgroundColor: '#1f0d14', borderRadius: 12, padding: 14 },
  cleared: { flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: hexA(C.success, 0.45), backgroundColor: '#0f1f1c' },
  title: { fontFamily: F.headline, color: C.danger, fontSize: 16, letterSpacing: 1 },
  track: { height: 6, borderRadius: 3, backgroundColor: '#3a1a22', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.danger },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 1, borderRadius: 10, padding: 12, backgroundColor: 'rgba(20,12,24,0.9)' },
  debuff: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: hexA(C.danger, 0.4), backgroundColor: C.dangerDim, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  debuffText: { fontFamily: F.monoBold, color: C.danger, fontSize: 11 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  passBtn: { borderWidth: 1, borderColor: hexA(C.gold, 0.4), backgroundColor: 'rgba(251,191,36,0.06)', borderRadius: 10, padding: 10 },
  passTitle: { fontFamily: F.title, color: C.gold, fontSize: 12, letterSpacing: 1.4 },
});

function confirmBox(title: string, msg: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${msg}`)) onOk();
    return;
  }
  Alert.alert(title, msg, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Gunakan', onPress: onOk },
  ]);
}

/** Tombol pakai Rest Pass untuk hari latihan ini */
export function RestPassControl({ compact }: { compact?: boolean }) {
  const { state, actions } = useStore();
  const today = dayKey();
  if (!isTrainingDay(state, today)) return null;
  if (state.passDays.includes(today))
    return (
      <View style={styles.passRow}>
        <Icon name="ticket-confirmation-outline" size={18} color={C.gold} />
        <Body size={13} color={C.gold} style={{ flex: 1 }}>
          Rest Pass aktif hari ini: tidak ada penalti, streak aman.
        </Body>
      </View>
    );
  if (state.sessions.some((s) => dayKey(s.startedAt) === today)) return null;
  const used = passesUsedThisMonth(state);
  const owned = state.restPasses ?? 0;
  const block = restPassBlock(state, today);
  if (owned <= 0)
    return compact ? null : (
      <View style={styles.passRow}>
        <Icon name="ticket-outline" size={18} color={C.textDim} />
        <Body size={12} color={C.textDim} style={{ flex: 1 }}>
          Berhalangan latihan? Beli Rest Pass ({REST_PASS_PRICE} koin) di Quest Board.
        </Body>
      </View>
    );
  return (
    <Pressable
      disabled={!!block}
      onPress={() =>
        confirmBox(
          'Gunakan Rest Pass?',
          `Hari ini dihitung izin: tidak ada Penalty Quest besok dan streak tetap aman.\n\nSisa: ${owned} Rest Pass · terpakai bulan ini ${used}/${REST_PASS_MONTHLY_LIMIT}.`,
          () => {
            const err = actions.useRestPass();
            if (err && Platform.OS === 'web') window.alert(err);
            else if (err) Alert.alert('Rest Pass', err);
          },
        )
      }
      style={({ pressed }) => [styles.passRow, styles.passBtn, !!block && { opacity: 0.5 }, pressed && { opacity: 0.8 }]}>
      <Icon name="ticket-outline" size={18} color={C.gold} />
      <View style={{ flex: 1 }}>
        <Text style={styles.passTitle}>GUNAKAN REST PASS</Text>
        <Body size={11} color={C.textDim}>
          {block ?? `Punya ${owned} · bulan ini ${used}/${REST_PASS_MONTHLY_LIMIT}`}
        </Body>
      </View>
      <Icon name="chevron-right" size={18} color={C.gold} />
    </Pressable>
  );
}
