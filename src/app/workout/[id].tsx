import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Field, IconButton, Label, Mono, Screen, Sheet, Stepper, TopBar } from '@/components/ui';
import { uid } from '@/store/defaults';
import { ATTR_LABEL, ATTRS, DAY_SHORT, fmtLoad, fromUnit, toUnit } from '@/store/logic';
import { useStore } from '@/store/store';
import type { ExerciseTemplate } from '@/store/types';
import { C, F } from '@/theme';

const blank = (): ExerciseTemplate => ({ id: uid(), name: '', sets: 3, repMin: 8, repMax: 12, tempo: '2010', restSec: 90, rir: 2, muscles: [], attr: 'STR', load: 20 });

export default function WorkoutEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const unit = state.settings.unit;
  const workout = state.workouts.find((w) => w.id === id);
  const [editing, setEditing] = useState<ExerciseTemplate | null>(null);
  const [muscleText, setMuscleText] = useState('');
  const [err, setErr] = useState('');

  if (!workout)
    return (
      <Screen header={<TopBar left={<IconButton name="chevron-left" onPress={() => router.back()} />} title="Dungeon" />}>
        <Body>Dungeon tidak ditemukan.</Body>
      </Screen>
    );

  const save = (patch: Partial<typeof workout>) => actions.saveWorkout({ ...workout, ...patch });
  const open = (e: ExerciseTemplate) => {
    setEditing({ ...e, load: toUnit(e.load, unit) });
    setMuscleText(e.muscles.join(', '));
    setErr('');
  };
  const commit = () => {
    if (!editing) return;
    if (!editing.name.trim()) return setErr('Nama latihan wajib diisi');
    if (editing.tempo && !/^[0-9xX]{4}$/.test(editing.tempo)) return setErr('Tempo harus 4 digit, mis. 3010 (atau kosong)');
    const ex: ExerciseTemplate = {
      ...editing,
      name: editing.name.trim(),
      repMax: Math.max(editing.repMin, editing.repMax),
      load: fromUnit(editing.load, unit),
      muscles: muscleText.split(',').map((m) => m.trim()).filter(Boolean),
    };
    const exists = workout.exercises.some((x) => x.id === ex.id);
    save({ exercises: exists ? workout.exercises.map((x) => (x.id === ex.id ? ex : x)) : [...workout.exercises, ex] });
    setEditing(null);
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= workout.exercises.length) return;
    const arr = [...workout.exercises];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    save({ exercises: arr });
  };
  const set = (p: Partial<ExerciseTemplate>) => setEditing((e) => (e ? { ...e, ...p } : e));

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="chevron-left" onPress={() => router.back()} />} title="Edit Dungeon" />}>
      <Card>
        <Field label="Nama dungeon" value={workout.name} onChangeText={(v) => save({ name: v })} mono={false} />
        <Field label="Target otot" value={workout.subtitle} onChangeText={(v) => save({ subtitle: v })} mono={false} />
        <Label style={{ marginTop: 16, marginBottom: 8 }}>Hari jadwal</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => {
            const on = (workout.day ?? 0) === d;
            const taken = d > 0 && state.workouts.some((w) => w.id !== workout.id && w.day === d);
            return (
              <Pressable
                key={d}
                disabled={taken}
                onPress={() => save({ day: d === 0 ? undefined : d })}
                style={[styles.day, on && { borderColor: C.lavender, backgroundColor: C.primaryDim }, taken && { opacity: 0.3 }]}>
                <Text style={[styles.dayText, on && { color: C.lavender }]}>{d === 0 ? 'Bebas' : DAY_SHORT[d]}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Label style={{ marginTop: 24, marginBottom: 10 }}>Exercises ({workout.exercises.length})</Label>
      <View style={{ gap: 10 }}>
        {workout.exercises.map((e, i) => (
          <Card key={e.id} onPress={() => open(e)} style={{ paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{e.name.toUpperCase()}</Text>
                <Mono size={12} style={{ marginTop: 4 }}>
                  {e.sets}×{e.repMin}-{e.repMax}
                  {e.mode === 'hold' ? 's' : ''}
                  {e.perSide ? '/sisi' : ''} · {e.tempo || 'no tempo'} · {e.restSec}s · {fmtLoad(e.load, unit)}
                  {unit} · {e.attr}
                </Mono>
              </View>
              <View>
                <IconButton name="chevron-up" size={18} color={i === 0 ? C.textFaint : C.lavender} onPress={() => move(i, -1)} />
                <IconButton name="chevron-down" size={18} color={i === workout.exercises.length - 1 ? C.textFaint : C.lavender} onPress={() => move(i, 1)} />
              </View>
              <IconButton name="trash-can-outline" size={20} color={C.textFaint} onPress={() => save({ exercises: workout.exercises.filter((x) => x.id !== e.id) })} />
            </View>
          </Card>
        ))}
      </View>
      <Button label="Add Exercise" icon="plus" variant="secondary" style={{ marginTop: 16 }} onPress={() => open(blank())} />

      <Sheet visible={!!editing} onClose={() => setEditing(null)} title="Exercise">
        {editing && (
          <ScrollView style={{ maxHeight: 560 }} keyboardShouldPersistTaps="handled">
            <Field label="Nama" value={editing.name} onChangeText={(v) => set({ name: v })} mono={false} placeholder="mis. Bench Press" />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Stepper label="Sets" value={editing.sets} min={1} onChange={(v) => set({ sets: Math.round(v) })} />
              <Stepper label="Rep min" value={editing.repMin} min={1} onChange={(v) => set({ repMin: Math.round(v) })} />
              <Stepper label="Rep max" value={editing.repMax} min={1} onChange={(v) => set({ repMax: Math.round(v) })} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Stepper label="Rest (s)" value={editing.restSec} step={15} onChange={(v) => set({ restSec: Math.round(v) })} />
              <Stepper label="RIR" value={editing.rir} onChange={(v) => set({ rir: Math.min(4, Math.round(v)) })} />
              <Stepper label={`Load ${unit}`} value={editing.load} step={unit === 'kg' ? 2.5 : 5} decimals={1} onChange={(v) => set({ load: v })} />
            </View>
            <Field label="Tempo (ecc-pause-con-pause)" value={editing.tempo} onChangeText={(v) => set({ tempo: v.slice(0, 4) })} placeholder="3010" maxLength={4} />
            <Field label="Otot (pisahkan koma)" value={muscleText} onChangeText={setMuscleText} mono={false} placeholder="Chest, Triceps" />
            <Label style={{ marginTop: 16, marginBottom: 8 }}>Atribut yang dilatih</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ATTRS.filter((a) => a !== 'DIS').map((a) => (
                <Pressable key={a} onPress={() => set({ attr: a })} style={[styles.attr, editing.attr === a && { borderColor: C.lavender, backgroundColor: C.primaryDim }]}>
                  <Text style={[styles.attrText, editing.attr === a && { color: C.lavender }]}>{a}</Text>
                  <Text style={styles.attrSub}>{ATTR_LABEL[a]}</Text>
                </Pressable>
              ))}
            </View>
            {err ? (
              <Body color={C.danger} style={{ marginTop: 10 }}>
                {err}
              </Body>
            ) : null}
            <Button label="Save Exercise" icon="check" size="lg" style={{ marginTop: 20 }} onPress={commit} />
          </ScrollView>
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: F.headline, color: C.text, fontSize: 16 },
  attr: { borderWidth: 1, borderColor: C.borderMuted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minWidth: 90 },
  attrText: { fontFamily: F.monoBold, color: C.textMuted, fontSize: 14 },
  day: { borderWidth: 1, borderColor: C.borderMuted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  dayText: { fontFamily: F.monoBold, color: C.textMuted, fontSize: 12 },
  attrSub: { fontFamily: F.body, color: C.textFaint, fontSize: 11 },
});
