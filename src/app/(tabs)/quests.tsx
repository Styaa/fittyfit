import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar, Body, Button, Card, Chip, Icon, IconButton, Label, Mono, ProgressBar, Screen, Sheet, Tag, TopBar } from '@/components/ui';
import { fmtBig, nextWorkout, QUESTS, questStatus, QuestType } from '@/store/logic';
import { useStore } from '@/store/store';
import type { Workout } from '@/store/types';
import { C, F, hexA, RANK_COLOR } from '@/theme';

type Tab = 'today' | 'log';

export default function QuestsScreen() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  return (
    <Screen
      header={
        <TopBar
          left={<Avatar uri={state.profile?.avatarUri} name={state.profile?.name} size={38} />}
          title={<Text style={styles.brand}>QUEST LOG</Text>}
          right={<IconButton name="playlist-edit" onPress={() => router.push('/program')} />}
        />
      }>
      <View style={styles.seg}>
        {(['today', 'log'] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segItem, tab === t && styles.segActive]}>
            <Text style={[styles.segText, tab === t && { color: '#2a1366' }]}>{t === 'today' ? "TODAY'S DUNGEON" : 'QUEST BOARD'}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'today' ? <TodayDungeon /> : <QuestBoard />}
    </Screen>
  );
}

function TodayDungeon() {
  const { state, actions } = useStore();
  const [pick, setPick] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const suggested = nextWorkout(state);
  const workout: Workout | undefined = state.active
    ? state.workouts.find((w) => w.id === state.active!.workoutId)
    : state.workouts.find((w) => w.id === chosenId) ?? suggested ?? undefined;

  if (!workout)
    return (
      <Card style={{ marginTop: 24, alignItems: 'center', gap: 12 }}>
        <Icon name="sword-cross" size={40} color={C.textFaint} />
        <Body center>Belum ada program latihan. Buat dungeon pertamamu.</Body>
        <Button label="Buat Program" icon="plus" onPress={() => router.push('/program')} />
      </Card>
    );

  const sets = state.active?.sets ?? [];
  const start = () => {
    if (!state.active) actions.startSession(workout);
    router.push('/session');
  };

  return (
    <View style={{ marginTop: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.success }} />
          <Text style={styles.sys}>{state.active ? 'DUNGEON IN PROGRESS' : 'SYSTEM STATUS: ONLINE'}</Text>
        </View>
        <Text style={styles.questTitle}>TODAY&apos;S QUEST — {workout.name.toUpperCase()}</Text>
        <Body size={17} center>
          {workout.subtitle}
        </Body>
        {!state.active && state.workouts.length > 1 && (
          <Pressable onPress={() => setPick(true)} style={{ marginTop: 10 }}>
            <Label color={C.lavender}>⇄ Ganti dungeon</Label>
          </Pressable>
        )}
      </View>

      <View style={{ gap: 14, marginTop: 24 }}>
        {workout.exercises.map((e) => {
          const done = sets.filter((s) => s.exerciseId === e.id).length;
          const pct = Math.min(1, done / e.sets);
          const complete = done >= e.sets;
          return (
            <Card key={e.id} tone={complete ? 'success' : 'default'}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View style={[styles.exIcon, complete && { borderColor: hexA(C.success, 0.4), backgroundColor: hexA(C.success, 0.1) }]}>
                  <Icon name={complete ? 'check-circle-outline' : e.attr === 'END' ? 'hand-back-right-outline' : 'dumbbell'} color={complete ? C.success : C.lavender} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, complete && { color: C.success }]}>{e.name.toUpperCase()}</Text>
                  <Mono size={13} style={{ marginTop: 4, letterSpacing: 1 }} color={complete ? C.success : C.textDim}>
                    {complete
                      ? `COMPLETED · ${e.sets} SETS`
                      : `${e.sets} SETS · ${e.repMin}-${e.repMax} REPS${e.tempo ? ' · ' + e.tempo : ''}`}
                  </Mono>
                </View>
                <Tag label={`${Math.round(pct * 100)}%`} color={complete ? C.success : C.lavender} />
              </View>
              {!complete && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                    <Label color={C.textMuted}>Progress</Label>
                    <Label color={C.textMuted}>
                      {done}/{e.sets} sets
                    </Label>
                  </View>
                  <ProgressBar value={pct} style={{ marginTop: 8 }} height={6} />
                </>
              )}
            </Card>
          );
        })}
      </View>

      <Button label={state.active ? 'Resume Dungeon' : 'Enter Dungeon'} icon="sword-cross" size="lg" pill onPress={start} style={{ marginTop: 28 }} />

      <Sheet visible={pick} onClose={() => setPick(false)} title="Pilih Dungeon">
        <ScrollView style={{ maxHeight: 420 }}>
          {state.workouts.map((w) => (
            <Card
              key={w.id}
              tone={w.id === workout.id ? 'active' : 'default'}
              style={{ marginBottom: 10 }}
              onPress={() => {
                setChosenId(w.id);
                setPick(false);
              }}>
              <Text style={styles.exName}>{w.name.toUpperCase()}</Text>
              <Body size={13}>
                {w.subtitle} · {w.exercises.length} exercises
              </Body>
            </Card>
          ))}
        </ScrollView>
      </Sheet>
    </View>
  );
}

function QuestBoard() {
  const { state, actions } = useStore();
  const [filter, setFilter] = useState<'ALL' | QuestType>('ALL');
  const list = QUESTS.filter((q) => filter === 'ALL' || q.type === filter);
  const stars = { E: 1, D: 1, C: 2, B: 2, A: 3, S: 3 } as const;

  return (
    <View style={{ marginTop: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Label>Reward: XP & Coins</Label>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="circle-multiple-outline" size={16} color={C.gold} />
          <Mono color={C.gold}>{state.coins}</Mono>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 10 }}>
        {(['ALL', 'DAILY', 'WEEKLY', 'EPIC'] as const).map((f) => (
          <Chip key={f} label={f === 'ALL' ? 'All Quests' : f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      <View style={{ gap: 14, marginTop: 10 }}>
        {list.map((q) => {
          const st = questStatus(state, q);
          const color = RANK_COLOR[q.rank];
          const isS = q.rank === 'S';
          return (
            <Card key={q.id} tone={st.claimed ? 'success' : st.accepted ? 'active' : 'default'}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', gap: 4, flex: 1, alignItems: 'center' }}>
                  {[0, 1, 2].map((i) => (
                    <Icon key={i} name={i < stars[q.rank] ? 'star-outline' : 'star-outline'} size={17} color={i < stars[q.rank] ? color : C.textFaint} />
                  ))}
                  <Mono color={color} style={{ marginLeft: 6 }}>
                    RANK {q.rank}
                  </Mono>
                </View>
                <Tag label={q.type} color={C.textDim} />
              </View>
              <Text style={[styles.qTitle, st.claimed && { textDecorationLine: 'line-through', color: C.textDim }]}>{q.title}</Text>
              <Body>{q.desc}</Body>

              {st.accepted && !st.claimed && (
                <View style={{ marginTop: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Label>Progress</Label>
                    <Mono size={12}>
                      {fmtBig(st.progress)}/{fmtBig(q.target)} {q.unit}
                    </Mono>
                  </View>
                  <ProgressBar value={st.progress / q.target} color={st.done ? 'success' : 'mana'} height={6} />
                </View>
              )}

              <View style={styles.reward}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="diamond-stone" size={20} color={C.success} />
                  <Mono color={C.text}>+{q.xp} XP</Mono>
                </View>
                {q.titleReward ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name="medal-outline" size={18} color={C.lavender} />
                    <Mono color={C.text} size={12}>
                      TITLE
                    </Mono>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name="circle-multiple-outline" size={18} color={C.gold} />
                    <Mono color={C.text}>+{q.coins} COINS</Mono>
                  </View>
                )}
              </View>

              {st.claimed ? (
                <Button label="Reward Claimed" icon="check" variant="ghost" disabled />
              ) : st.accepted ? (
                <Button label={st.done ? 'Claim Reward' : 'Quest Active'} icon={st.done ? 'gift-outline' : 'timer-sand'} variant={st.done ? 'success' : 'ghost'} disabled={!st.done} onPress={() => actions.claimQuest(q.id)} />
              ) : (
                <Button
                  label="Accept Quest"
                  icon="sword-cross"
                  variant={isS ? 'danger' : q.type === 'DAILY' ? 'light' : 'secondary'}
                  onPress={() => actions.acceptQuest(q.id)}
                />
              )}
            </Card>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { fontFamily: F.headline, color: C.lavenderSoft, fontSize: 22, letterSpacing: 0.5 },
  seg: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 999, borderWidth: 1, borderColor: C.border, padding: 4 },
  segItem: { flex: 1, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segActive: { backgroundColor: C.lavender },
  segText: { fontFamily: F.title, fontSize: 12, letterSpacing: 1.4, color: C.textMuted },
  sys: { fontFamily: F.mono, color: C.success, fontSize: 14, letterSpacing: 1.5 },
  questTitle: { fontFamily: F.display, color: '#ece6ff', fontSize: 32, lineHeight: 38, textAlign: 'center', marginTop: 10, marginBottom: 8 },
  exIcon: { width: 50, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#3a3448', backgroundColor: '#1b1726', alignItems: 'center', justifyContent: 'center' },
  exName: { fontFamily: F.headline, color: C.text, fontSize: 19, letterSpacing: 0.3 },
  qTitle: { fontFamily: F.title, color: C.text, fontSize: 21, marginTop: 14, marginBottom: 6 },
  reward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2535',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    marginVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
