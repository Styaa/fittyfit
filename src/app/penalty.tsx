import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MoveDemo } from '@/components/move-demo';
import { useMidnightCountdown } from '@/components/penalty';
import { Body, Button, Card, Icon, IconButton, Label, Mono, Screen, TopBar } from '@/components/ui';
import { fmtClock } from '@/store/dates';
import { PENALTY_SETS } from '@/store/penalty';
import { useStore } from '@/store/store';
import { C, F, glow, hexA } from '@/theme';

function PlankTimer({ seconds }: { seconds: number }) {
  const [end, setEnd] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!end) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [end]);
  const left = end ? Math.max(0, Math.ceil((end - now) / 1000)) : seconds;
  const done = !!end && left === 0;
  useEffect(() => {
    if (done && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [done]);
  return (
    <Pressable onPress={() => setEnd(Date.now() + seconds * 1000)} style={[styles.timerBtn, done && { borderColor: C.success }]}>
      <Icon name={done ? 'check' : end ? 'timer-sand' : 'play'} size={14} color={done ? C.success : C.lavender} />
      <Text style={[styles.timerText, done && { color: C.success }]}>{done ? 'SELESAI' : end ? `${left}s` : `MULAI ${seconds}s`}</Text>
    </Pressable>
  );
}

export default function PenaltyScreen() {
  const { state, actions } = useStore();
  const p = state.penalty;
  const left = useMidnightCountdown();
  const [open, setOpen] = useState(0);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!p)
    return (
      <Screen header={<TopBar left={<IconButton name="close" onPress={close} />} title="Penalty Quest" />}>
        <Card style={{ alignItems: 'center', gap: 10 }}>
          <Icon name="shield-check-outline" size={40} color={C.success} />
          <Body center>Tidak ada Penalty Quest aktif. Pertahankan.</Body>
          <Button label="Kembali" onPress={close} />
        </Card>
      </Screen>
    );

  const list = PENALTY_SETS[p.focus];
  const cleared = p.status === 'cleared';

  const roundDone = () => {
    if (state.settings.haptics && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    actions.penaltyRoundDone();
  };

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="close" color={C.textMuted} onPress={close} />} title={<Text style={styles.top}>⚠ PENALTY QUEST</Text>} />}>
      {cleared ? (
        <Card tone="success" style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="check-decagram" size={44} color={C.success} />
          <Text style={[styles.big, { color: C.success }]}>PENALTY CLEARED</Text>
          <Body center color={C.text}>
            Streak dipulihkan. Hari yang terlewat dihitung sebagai &quot;penalti dibersihkan&quot;.
          </Body>
          <Button label="Kembali ke Dungeon" variant="success" onPress={close} style={{ alignSelf: 'stretch', marginTop: 10 }} />
        </Card>
      ) : (
        <View style={[styles.sys, glow(C.danger, 18, 0.25)]}>
          <Label color={C.danger}>[System]</Label>
          <Body color={C.text} style={{ marginTop: 4 }}>
            Kamu melewatkan Dungeon: <Text style={{ fontFamily: F.bodyBold }}>{p.workoutName}</Text>. Selesaikan {p.rounds} ronde sebelum batas waktu, atau streak
            akan dihapus dan debuff WEAKENED aktif.
          </Body>
          <View style={styles.countRow}>
            <Icon name="timer-outline" size={20} color={C.danger} />
            <Text style={styles.count}>{fmtClock(left)}</Text>
            <Label color={C.textDim}>tersisa hari ini</Label>
          </View>
        </View>
      )}

      <View style={styles.rounds}>
        {Array.from({ length: p.rounds }, (_, i) => {
          const done = i < p.roundsDone;
          const cur = i === p.roundsDone && !cleared;
          return (
            <View key={i} style={[styles.round, done && styles.roundDone, cur && styles.roundCur]}>
              {done ? <Icon name="check" size={18} color={C.success} /> : <Text style={[styles.roundNum, cur && { color: C.danger }]}>{i + 1}</Text>}
              <Text style={styles.roundLabel}>RONDE</Text>
            </View>
          );
        })}
      </View>

      <Label style={{ marginTop: 18, marginBottom: 8 }}>Tiap ronde · tanpa beban · sisakan ±2 rep</Label>
      <View style={{ gap: 10 }}>
        {list.map((ex, i) => (
          <Card key={ex.name} onPress={() => setOpen(open === i ? -1 : i)} style={{ paddingVertical: 12 }} tone={open === i ? 'active' : 'default'}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.idx}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.exName}>{ex.name.toUpperCase()}</Text>
                <Mono size={13} color={C.textMuted}>
                  {ex.reps} {ex.unit}
                </Mono>
              </View>
              {ex.unit === 'detik' ? <PlankTimer seconds={ex.reps} /> : <Icon name={open === i ? 'chevron-up' : 'play-circle-outline'} size={22} color={C.textDim} />}
            </View>
            {open === i && (
              <View style={{ marginTop: 12 }}>
                <MoveDemo name={ex.anim} height={150} />
              </View>
            )}
          </Card>
        ))}
      </View>

      {!cleared && (
        <>
          <Button label={`Ronde ${p.roundsDone + 1} selesai`} icon="check" size="lg" variant="danger" onPress={roundDone} style={{ marginTop: 22, height: 60 }} />
          {p.roundsDone > 0 && (
            <Pressable onPress={actions.penaltyRoundUndo} style={{ alignSelf: 'center', marginTop: 12 }}>
              <Label color={C.textDim}>↶ Batalkan ronde terakhir</Label>
            </Pressable>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { fontFamily: F.headline, color: C.danger, fontSize: 18, letterSpacing: 1 },
  big: { fontFamily: F.display, fontSize: 26 },
  sys: { borderWidth: 1, borderColor: hexA(C.danger, 0.5), backgroundColor: '#1f0d14', borderRadius: 12, padding: 16 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  count: { fontFamily: F.monoBold, color: '#fca5a5', fontSize: 24 },
  rounds: { flexDirection: 'row', gap: 10, marginTop: 18 },
  round: { flex: 1, height: 64, borderRadius: 10, borderWidth: 1, borderColor: C.borderMuted, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  roundDone: { borderColor: hexA(C.success, 0.5), backgroundColor: C.successDim },
  roundCur: { borderColor: C.danger, ...glow(C.danger, 10, 0.4) },
  roundNum: { fontFamily: F.display, color: C.textMuted, fontSize: 22 },
  roundLabel: { fontFamily: F.label, color: C.textDim, fontSize: 9, letterSpacing: 1.5 },
  idx: { fontFamily: F.monoBold, color: C.danger, fontSize: 16, width: 18 },
  exName: { fontFamily: F.headline, color: C.text, fontSize: 16 },
  timerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.borderStrong, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  timerText: { fontFamily: F.monoBold, color: C.lavender, fontSize: 12 },
});
