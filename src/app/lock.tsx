import { lockSupported, nativeLockedNow, openAllowedApp, stopLockTest, type AllowedApp } from '@modules/shadow-lock';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, Button, Card, Icon, IconName, Label, Mono, Screen } from '@/components/ui';
import { dayKey, fmtClock } from '@/store/dates';
import { EMERGENCY_PHRASE, EMERGENCY_WAIT_SEC, fmtLockTime, lockActiveNow } from '@/store/lock';
import { todayPlan } from '@/store/logic';
import { REST_PASS_MONTHLY_LIMIT, passesUsedThisMonth, restPassBlock } from '@/store/penalty';
import { useStore } from '@/store/store';
import { C, F, glow, hexA } from '@/theme';

const APPS: { kind: AllowedApp; label: string; icon: IconName }[] = [
  { kind: 'dialer', label: 'Telepon', icon: 'phone' },
  { kind: 'sms', label: 'SMS', icon: 'message-text-outline' },
  { kind: 'alarm', label: 'Alarm', icon: 'alarm' },
  { kind: 'maps', label: 'Peta', icon: 'map-marker-outline' },
  { kind: 'settings', label: 'Setelan', icon: 'cog-outline' },
];

export default function LockScreen() {
  const { state, actions } = useStore();
  const [now, setNow] = useState(new Date());
  const [nativeLock, setNativeLock] = useState(nativeLockedNow());
  const [showEmergency, setShowEmergency] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [waitEnd, setWaitEnd] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      setNativeLock(nativeLockedNow());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const locked = lockActiveNow(state, now) || nativeLock;
  const plan = todayPlan(state, now);
  const workout = plan.kind === 'workout' ? plan.workout : null;
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const leftToMidnight = (midnight.getTime() - now.getTime()) / 1000;
  const passBlock = restPassBlock(state);
  const owned = state.restPasses ?? 0;
  const phraseOk = phrase.trim().toLowerCase() === EMERGENCY_PHRASE.toLowerCase();
  const waitLeft = waitEnd ? Math.max(0, Math.ceil((waitEnd - now.getTime()) / 1000)) : EMERGENCY_WAIT_SEC;

  useEffect(() => {
    if (phraseOk && !waitEnd) setWaitEnd(Date.now() + EMERGENCY_WAIT_SEC * 1000);
    if (!phraseOk && waitEnd) setWaitEnd(null);
  }, [phraseOk, waitEnd]);

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const enterDungeon = () => {
    if (!state.active && workout) actions.startSession(workout);
    router.replace('/session');
  };

  if (!locked)
    return (
      <Screen>
        <Card tone="success" style={{ alignItems: 'center', gap: 10, marginTop: 40 }}>
          <Icon name="lock-open-variant-outline" size={44} color={C.success} />
          <Text style={[styles.big, { color: C.success }]}>AKSES DIBUKA</Text>
          <Body center color={C.text}>
            Tidak ada lockdown aktif saat ini.
            {state.settings.lock.enabled ? ` Lockdown berlaku mulai ${fmtLockTime(state)} di hari latihan jika dungeon belum selesai.` : ''}
          </Body>
          <Button label="Lanjut" variant="success" onPress={leave} style={{ alignSelf: 'stretch', marginTop: 8 }} />
        </Card>
      </Screen>
    );

  return (
    <Screen padBottom={40}>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <View style={[styles.lockIcon, glow(C.danger, 30, 0.45)]}>
          <Icon name="lock" size={40} color={C.danger} />
        </View>
        <Label color={C.danger} style={{ marginTop: 18 }}>
          [System]
        </Label>
        <Text style={styles.title}>LOCKDOWN</Text>
        <Text style={styles.clock}>{now.toTimeString().slice(0, 8)}</Text>
        <Body center color={C.text} style={{ marginTop: 10 }}>
          {workout ? (
            <>
              Dungeon hari ini <Text style={{ fontFamily: F.bodyBold }}>{workout.name}</Text> belum diselesaikan. Akses aplikasi dibatasi sampai quest selesai.
            </>
          ) : (
            'Mode uji lockdown aktif.'
          )}
        </Body>
        <Mono size={12} color={C.textDim} style={{ marginTop: 8 }}>
          kunci berakhir otomatis dalam {fmtClock(leftToMidnight)}
        </Mono>
      </View>

      <Button label={state.active ? 'Lanjutkan Dungeon' : 'Masuk Dungeon'} icon="sword-cross" size="lg" pill onPress={enterDungeon} style={{ marginTop: 28 }} />

      {owned > 0 && (
        <Pressable
          disabled={!!passBlock}
          onPress={() => {
            const err = actions.useRestPass();
            if (!err) stopLockTest();
          }}
          style={({ pressed }) => [styles.pass, !!passBlock && { opacity: 0.5 }, pressed && { opacity: 0.8 }]}>
          <Icon name="ticket-confirmation-outline" size={22} color={C.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.passTitle}>GUNAKAN REST PASS</Text>
            <Body size={12} color={C.textDim}>
              {passBlock ?? `Kunci dibuka & tidak ada penalti besok · punya ${owned} · bulan ini ${passesUsedThisMonth(state)}/${REST_PASS_MONTHLY_LIMIT}`}
            </Body>
          </View>
          <Icon name="chevron-right" size={20} color={C.gold} />
        </Pressable>
      )}

      <Label style={{ marginTop: 26, marginBottom: 10 }}>Tetap bisa dibuka</Label>
      <View style={styles.apps}>
        {APPS.map((a) => (
          <Pressable key={a.kind} onPress={() => openAllowedApp(a.kind)} disabled={!lockSupported} style={({ pressed }) => [styles.app, pressed && { opacity: 0.7 }, !lockSupported && { opacity: 0.4 }]}>
            <Icon name={a.icon} size={24} color={C.lavender} />
            <Text style={styles.appLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 28 }}>
        {!showEmergency ? (
          <Pressable onPress={() => setShowEmergency(true)} style={{ alignSelf: 'center' }}>
            <Label color={C.textFaint}>Buka darurat</Label>
          </Pressable>
        ) : (
          <Card>
            <Label color={C.danger}>Buka darurat</Label>
            <Body size={13} style={{ marginTop: 6 }}>
              Ketik kalimat berikut persis, lalu tunggu {EMERGENCY_WAIT_SEC} detik. Kunci dibuka untuk malam ini, tapi{' '}
              <Text style={{ color: C.danger }}>Penalty Quest besok tetap berlaku</Text>.
            </Body>
            <Mono size={13} color={C.text} style={{ marginTop: 10 }}>
              “{EMERGENCY_PHRASE}”
            </Mono>
            <TextInput
              value={phrase}
              onChangeText={setPhrase}
              placeholder="Ketik di sini..."
              placeholderTextColor={C.textFaint}
              autoCorrect={false}
              autoCapitalize="none"
              style={[styles.input, phraseOk && { borderColor: C.danger }]}
            />
            <Button
              label={!phraseOk ? 'Ketik kalimat dulu' : waitLeft > 0 ? `Tunggu ${waitLeft} detik` : 'Buka kunci malam ini'}
              variant="danger"
              disabled={!phraseOk || waitLeft > 0}
              onPress={() => {
                actions.emergencyUnlock();
                stopLockTest();
              }}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}
      </View>
      <Body size={11} center style={{ marginTop: 18, color: C.textFaint }}>
        {dayKey(now)} · Lockdown mulai {fmtLockTime(state)} di hari latihan
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: F.display, fontSize: 26 },
  lockIcon: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: C.danger, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f0d14' },
  title: { fontFamily: F.display, color: C.danger, fontSize: 44, letterSpacing: 2, textShadowColor: 'rgba(248,113,113,0.5)', textShadowRadius: 16 },
  clock: { fontFamily: F.monoBold, color: '#fca5a5', fontSize: 30, marginTop: 4 },
  pass: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, borderWidth: 1, borderColor: hexA(C.gold, 0.45), backgroundColor: 'rgba(251,191,36,0.07)', borderRadius: 12, padding: 14 },
  passTitle: { fontFamily: F.title, color: C.gold, fontSize: 13, letterSpacing: 1.4 },
  apps: { flexDirection: 'row', gap: 8 },
  app: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  appLabel: { fontFamily: F.label, color: C.textMuted, fontSize: 10, letterSpacing: 0.8 },
  input: { marginTop: 10, borderWidth: 1, borderColor: C.borderMuted, borderRadius: 8, paddingHorizontal: 12, height: 46, color: C.text, fontFamily: F.body, backgroundColor: C.surfaceInput },
});
