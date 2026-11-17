import { router } from 'expo-router';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { WeekBanner } from '@/components/program';
import { Body, Button, Card, IconButton, Label, Mono, Screen, TopBar } from '@/components/ui';
import { fmtShortDate } from '@/store/dates';
import { uid } from '@/store/defaults';
import { DAY_NAMES, hasSchedule, isoDay, programWeek, todayPlan } from '@/store/logic';
import { useStore } from '@/store/store';
import { C, F } from '@/theme';

function ask(title: string, msg: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${msg}`)) onOk();
    return;
  }
  Alert.alert(title, msg, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Ya', style: 'destructive', onPress: onOk },
  ]);
}

export default function ProgramScreen() {
  const { state, actions } = useStore();
  const plan = todayPlan(state);
  const todayId = plan.kind === 'workout' ? plan.workout.id : null;
  const wk = programWeek(state);
  const scheduled = hasSchedule(state);
  const list = [...state.workouts].sort((a, b) => (a.day ?? 99) - (b.day ?? 99));

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="chevron-left" onPress={() => router.back()} />} title="Program" />}>
      <Text style={styles.h1}>{(state.program?.name ?? 'Program').toUpperCase()}</Text>
      <Body>
        {scheduled
          ? 'Dungeon dipilih otomatis sesuai hari. Set, RIR, istirahat, teknik intensitas, dan finisher menyesuaikan minggu program.'
          : 'Dungeon dijalankan bergiliran sesuai urutan.'}
      </Body>

      {state.program && (
        <View style={{ marginTop: 18, gap: 10 }}>
          <WeekBanner />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Mono size={12} style={{ flex: 1 }}>
              Mulai {fmtShortDate(state.program.startDate)} · total minggu ke-{wk?.abs}
            </Mono>
            <Button label="−1 mgg" variant="ghost" size="sm" style={{ width: 84 }} onPress={() => actions.shiftProgramWeek(-1)} disabled={(wk?.abs ?? 1) <= 1} />
            <Button label="+1 mgg" variant="ghost" size="sm" style={{ width: 84 }} onPress={() => actions.shiftProgramWeek(1)} />
          </View>
          <Button
            label="Mulai ulang dari minggu 1"
            variant="ghost"
            size="sm"
            icon="restart"
            onPress={() => ask('Mulai ulang program?', 'Minggu program kembali ke minggu 1 mulai minggu ini. Riwayat latihan tidak dihapus.', () => actions.restartProgram())}
          />
        </View>
      )}

      <Label style={{ marginTop: 24, marginBottom: 10 }}>Jadwal mingguan</Label>
      <View style={{ gap: 10 }}>
        {list.map((w, i) => (
          <Card key={w.id} tone={todayId === w.id ? 'active' : 'default'} onPress={() => router.push({ pathname: '/workout/[id]', params: { id: w.id } })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.dayBox}>
                <Text style={styles.dayText}>{w.day ? DAY_NAMES[w.day].slice(0, 3).toUpperCase() : String(i + 1).padStart(2, '0')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{w.name.toUpperCase()}</Text>
                <Body size={13}>
                  {w.subtitle} · {w.exercises.length} gerakan
                </Body>
                {todayId === w.id && (
                  <Mono size={11} color={C.success} style={{ marginTop: 4 }}>
                    ▶ HARI INI
                  </Mono>
                )}
              </View>
              {!scheduled && (
                <View>
                  <IconButton name="chevron-up" size={20} color={i === 0 ? C.textFaint : C.lavender} onPress={() => actions.moveWorkout(w.id, -1)} />
                  <IconButton name="chevron-down" size={20} color={i === list.length - 1 ? C.textFaint : C.lavender} onPress={() => actions.moveWorkout(w.id, 1)} />
                </View>
              )}
              <IconButton name="trash-can-outline" size={20} color={C.textFaint} onPress={() => ask('Hapus dungeon?', w.name, () => actions.deleteWorkout(w.id))} />
            </View>
          </Card>
        ))}
        {scheduled &&
          [1, 2, 3, 4, 5, 6, 7]
            .filter((d) => !state.workouts.some((w) => w.day === d))
            .map((d) => (
              <View key={d} style={[styles.restRow, d === isoDay() && { borderColor: C.success }]}>
                <View style={[styles.dayBox, { borderColor: '#2a2535' }]}>
                  <Text style={[styles.dayText, { color: C.textDim }]}>{DAY_NAMES[d].slice(0, 3).toUpperCase()}</Text>
                </View>
                <Body style={{ flex: 1 }}>Istirahat / jalan santai / stretching</Body>
              </View>
            ))}
      </View>

      <Button
        label="New Dungeon"
        icon="plus"
        variant="secondary"
        style={{ marginTop: 20 }}
        onPress={() => {
          const id = uid();
          actions.saveWorkout({ id, name: `Day ${state.workouts.length + 1}`, subtitle: 'Full Body', exercises: [] });
          router.push({ pathname: '/workout/[id]', params: { id } });
        }}
      />
      <Button
        label="Pasang ulang Program 8 Minggu"
        icon="download"
        variant="ghost"
        style={{ marginTop: 10 }}
        onPress={() =>
          ask('Pasang Program Hipertrofi 8 Minggu?', 'Semua dungeon saat ini diganti dengan program 8 minggu (Push/Pull/Leg A & B) dan minggu dimulai dari 1. Riwayat latihan tetap aman.', () =>
            actions.installProgram(),
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: F.headline, color: C.text, fontSize: 26, letterSpacing: 0.8, marginTop: 8, marginBottom: 8 },
  name: { fontFamily: F.headline, color: C.text, fontSize: 18 },
  dayBox: { width: 50, height: 50, borderRadius: 10, borderWidth: 1, borderColor: C.borderStrong, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: F.monoBold, color: C.lavender, fontSize: 13 },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#2f2a3d', borderRadius: 12, padding: 12 },
});
