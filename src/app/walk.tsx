import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Icon, IconButton, Label, Mono, ProgressBar, Screen, TopBar } from '@/components/ui';
import { dayKey, fmtClock } from '@/store/dates';
import { QUESTS, questPeriod, questStatus, walkedKm, WALK_AGI_PER_KM } from '@/store/logic';
import { useStore } from '@/store/store';
import { C, F, glow, hexA } from '@/theme';
import { fmtKm, fmtPace } from '@/walk/geo';
import { discardWalk, finishWalk, pauseWalk, resumeWalk, startWalk, useWalk, walkElapsed, type StartError } from '@/walk/tracker';

const START_ERRORS: Record<StartError, string> = {
  denied: 'Izin lokasi ditolak. Izinkan lokasi "saat aplikasi digunakan" untuk Shadow Fit di Setelan agar jarak bisa dihitung.',
  'gps-off': 'GPS/lokasi HP sedang mati. Nyalakan lokasi lalu coba lagi.',
  error: 'Gagal memulai Mode Jalan. Coba lagi.',
};

function confirmBox(title: string, msg: string, ok: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${msg}`)) onOk();
    return;
  }
  Alert.alert(title, msg, [
    { text: 'Batal', style: 'cancel' },
    { text: ok, onPress: onOk },
  ]);
}

export default function WalkScreen() {
  const { state, actions } = useStore();
  const walk = useWalk();
  const [err, setErr] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [summary, setSummary] = useState<null | { km: number; sec: number; pace: string; agi: number; cleared: string[] }>(null);

  const walkQuests = QUESTS.filter((q) => q.walkKm);
  const accepted = walkQuests.filter((q) => questStatus(state, q).accepted);
  const todayFrom = questPeriod(walkQuests[0]).from;
  const savedKm = walkedKm(state, todayFrom);
  const liveKm = savedKm + (walk.active ? walk.distanceM / 1000 : 0);
  const elapsed = walkElapsed(walk);

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/quests'));

  const start = async () => {
    setErr(null);
    setStarting(true);
    const e = await startWalk();
    setStarting(false);
    if (e) setErr(START_ERRORS[e]);
  };

  const finish = () =>
    confirmBox('Selesai jalan?', `Jarak ${fmtKm(walk.distanceM)} km akan disimpan.`, 'Selesai', async () => {
      const before = accepted.filter((q) => questStatus(state, q).done).map((q) => q.id);
      const res = await finishWalk();
      if (!res) return;
      actions.addWalk({ startedAt: new Date(res.startedAt).toISOString(), endedAt: new Date(res.endedAt).toISOString(), distanceM: res.distanceM, durationSec: res.durationSec });
      const total = savedKm + res.distanceM / 1000;
      const cleared = accepted.filter((q) => total >= (q.walkKm ?? Infinity) && !before.includes(q.id)).map((q) => q.title);
      if (state.settings.haptics && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSummary({ km: res.distanceM / 1000, sec: res.durationSec, pace: fmtPace(res.distanceM, res.durationSec), agi: (res.distanceM / 1000) * WALK_AGI_PER_KM, cleared });
    });

  // ---------- ringkasan ----------
  if (summary)
    return (
      <Screen header={<TopBar left={<IconButton name="close" onPress={leave} />} title="Mode Jalan" />}>
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Label color={C.success}>Perjalanan selesai</Label>
          <Text style={styles.bigKm}>{summary.km.toFixed(2).replace('.', ',')}</Text>
          <Mono color={C.textDim}>KILOMETER</Mono>
        </View>
        <View style={styles.statsRow}>
          <Stat label="Durasi" value={fmtClock(summary.sec)} />
          <Stat label="Pace /km" value={summary.pace} />
          <Stat label="AGI (poin)" value={`+${summary.agi.toFixed(1).replace('.', ',')}`} accent />
        </View>
        {summary.cleared.length > 0 ? (
          <Card tone="success" style={{ marginTop: 20 }}>
            <Label color={C.success}>Quest tercapai</Label>
            {summary.cleared.map((t) => (
              <Body key={t} color={C.text}>
                ✓ {t}
              </Body>
            ))}
            <Body size={12} style={{ marginTop: 6, color: C.textDim }}>
              Klaim hadiahnya di Quest Board.
            </Body>
          </Card>
        ) : null}
        <Button label="Ke Quest Board" icon="sword-cross" size="lg" onPress={() => router.replace('/quests')} style={{ marginTop: 24 }} />
      </Screen>
    );

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="chevron-left" onPress={leave} />} title="Mode Jalan" />}>
      {/* jarak utama */}
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[styles.dot, { backgroundColor: walk.active ? (walk.paused ? C.gold : C.success) : C.textFaint }]} />
          <Text style={styles.status}>{!walk.active ? 'SIAP' : walk.paused ? 'DIJEDA' : 'MELACAK GPS'}</Text>
        </View>
        <Text style={[styles.bigKm, walk.active && !walk.paused && styles.glowText]}>{fmtKm(walk.distanceM)}</Text>
        <Mono color={C.textDim}>KM SESI INI</Mono>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Durasi" value={fmtClock(elapsed)} />
        <Stat label="Pace /km" value={fmtPace(walk.distanceM, elapsed)} />
        <Stat label="Hari ini" value={`${liveKm.toFixed(2).replace('.', ',')} km`} accent />
      </View>

      {walk.active && (
        <Mono size={11} color={C.textFaint} style={{ textAlign: 'center', marginTop: 10 }}>
          {walk.lastAcc == null
            ? 'menunggu sinyal GPS…'
            : `akurasi GPS ±${Math.round(walk.lastAcc)} m · ${walk.lastAcc <= 12 ? 'bagus' : walk.lastAcc <= 25 ? 'sedang' : 'lemah'}`}
        </Mono>
      )}

      {/* target quest */}
      <Label style={{ marginTop: 24, marginBottom: 10 }}>Target quest jalan hari ini</Label>
      {accepted.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 10 }}>
          <Icon name="walk" size={34} color={C.textFaint} />
          <Body center>Mode Jalan dimulai dari quest. Terima salah satu quest jalan (1–10 km) di Quest Board dulu.</Body>
          <Button label="Buka Quest Board" icon="sword-cross" variant="secondary" onPress={() => router.replace('/quests')} />
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {accepted.map((q) => {
            const km = q.walkKm!;
            const done = liveKm >= km;
            const claimed = questStatus(state, q).claimed;
            return (
              <View key={q.id} style={[styles.target, done && { borderColor: hexA(C.success, 0.5), backgroundColor: '#0f1f1c' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[styles.targetTitle, done && { color: C.success }]}>{q.title.toUpperCase()}</Text>
                  <Mono size={12} color={done ? C.success : C.textMuted}>
                    {claimed ? 'DIKLAIM ✓' : `${Math.min(liveKm, km).toFixed(2).replace('.', ',')} / ${km} km`}
                  </Mono>
                </View>
                <ProgressBar value={liveKm / km} color={done ? 'success' : 'mana'} height={6} />
              </View>
            );
          })}
        </View>
      )}

      {err ? (
        <Card tone="danger" style={{ marginTop: 16 }}>
          <Body color={C.text}>{err}</Body>
        </Card>
      ) : null}

      {/* kontrol */}
      {!walk.active ? (
        <Button
          label={starting ? 'Menyiapkan GPS…' : 'Mulai Jalan'}
          icon="walk"
          size="lg"
          pill
          disabled={accepted.length === 0 || starting}
          onPress={start}
          style={{ marginTop: 24 }}
        />
      ) : (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          <Pressable onPress={walk.paused ? resumeWalk : pauseWalk} style={styles.pauseBtn} accessibilityLabel={walk.paused ? 'Lanjutkan' : 'Jeda'}>
            <Icon name={walk.paused ? 'play' : 'pause'} size={26} color={C.lavender} />
          </Pressable>
          <Button label="Selesai" icon="flag-checkered" size="lg" onPress={finish} style={{ flex: 1, height: 60 }} />
        </View>
      )}
      {walk.active && (
        <Pressable
          onPress={() => confirmBox('Buang sesi jalan?', 'Jarak sesi ini tidak akan disimpan.', 'Buang', () => discardWalk())}
          style={{ alignSelf: 'center', marginTop: 14 }}>
          <Label color={C.textFaint}>Buang sesi ini</Label>
        </Pressable>
      )}

      <Body size={12} center style={{ marginTop: 20, color: C.textFaint }}>
        Lokasi hanya dipakai selama Mode Jalan aktif dan tidak dikirim ke mana pun. Pelacakan tetap berjalan saat layar mati (lihat notifikasi “Mode Jalan aktif”). Setiap 1 km =
        +1 poin AGI. Hari ini: {dayKey()}.
      </Body>
    </Screen>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.stat, accent && { borderColor: C.borderStrong }]}>
      <Label>{label}</Label>
      <Text style={[styles.statVal, accent && { color: C.lavender }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { width: 9, height: 9, borderRadius: 5 },
  status: { fontFamily: F.mono, color: C.textMuted, fontSize: 13, letterSpacing: 1.5 },
  bigKm: { fontFamily: F.display, color: C.lavenderSoft, fontSize: 84, lineHeight: 92, marginTop: 6 },
  glowText: { textShadowColor: 'rgba(196,181,253,0.55)', textShadowRadius: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stat: { flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', gap: 6 },
  statVal: { fontFamily: F.monoBold, color: C.text, fontSize: 18 },
  target: { borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 12, padding: 14 },
  targetTitle: { flex: 1, fontFamily: F.headline, color: C.text, fontSize: 14, letterSpacing: 0.5 },
  pauseBtn: { width: 76, height: 60, borderRadius: 14, borderWidth: 1.5, borderColor: C.lavender, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, ...glow(C.primary, 10, 0.2) },
});
