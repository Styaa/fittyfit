import { router } from 'expo-router';
import React from 'react';
import { Platform, Alert, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, IconButton, Mono, Screen, TopBar } from '@/components/ui';
import { nextWorkout } from '@/store/logic';
import { useStore } from '@/store/store';
import { uid } from '@/store/defaults';
import { C, F } from '@/theme';

export default function ProgramScreen() {
  const { state, actions } = useStore();
  const next = nextWorkout(state);

  const remove = (id: string, name: string) => {
    const go = () => actions.deleteWorkout(id);
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Hapus ${name}?`)) go();
    } else Alert.alert('Hapus dungeon?', name, [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: go }]);
  };

  return (
    <Screen padBottom={40} header={<TopBar left={<IconButton name="chevron-left" onPress={() => router.back()} />} title="Program" />}>
      <Text style={styles.h1}>DUNGEON ROTATION</Text>
      <Body>Dungeon dijalankan bergiliran sesuai urutan. Dungeon berikutnya otomatis dipilih setelah sesi terakhir.</Body>

      <View style={{ gap: 12, marginTop: 20 }}>
        {state.workouts.map((w, i) => (
          <Card key={w.id} tone={next?.id === w.id ? 'active' : 'default'} onPress={() => router.push({ pathname: '/workout/[id]', params: { id: w.id } })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Mono color={C.textFaint} size={16}>
                {String(i + 1).padStart(2, '0')}
              </Mono>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{w.name.toUpperCase()}</Text>
                <Body size={13}>
                  {w.subtitle} · {w.exercises.length} exercises
                </Body>
                {next?.id === w.id && (
                  <Mono size={11} color={C.success} style={{ marginTop: 4 }}>
                    ▶ NEXT UP
                  </Mono>
                )}
              </View>
              <View>
                <IconButton name="chevron-up" size={20} color={i === 0 ? C.textFaint : C.lavender} onPress={() => actions.moveWorkout(w.id, -1)} />
                <IconButton name="chevron-down" size={20} color={i === state.workouts.length - 1 ? C.textFaint : C.lavender} onPress={() => actions.moveWorkout(w.id, 1)} />
              </View>
              <IconButton name="trash-can-outline" size={20} color={C.textFaint} onPress={() => remove(w.id, w.name)} />
            </View>
          </Card>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: F.headline, color: C.text, fontSize: 28, letterSpacing: 1, marginTop: 8, marginBottom: 8 },
  name: { fontFamily: F.headline, color: C.text, fontSize: 18 },
});
