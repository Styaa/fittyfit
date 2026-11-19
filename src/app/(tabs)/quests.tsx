import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar, Body, Button, Card, Chip, Icon, IconButton, Label, Mono, ProgressBar, Screen, Sheet, Tag, TopBar } from '@/components/ui';
import { DeadlineTimer } from '@/components/deadline-timer';
import { PenaltyCard, RestPassControl, SystemNotice } from '@/components/penalty';
import { ExerciseGuideSheet, InfoCard, rxLine, TECH_LABEL, WeekBanner } from '@/components/program';
import { dayKey } from '@/store/dates';
import { DAY_NAMES, DAY_SHORT, fmtBig, isoDay, programWeek, QUESTS, questStatus, QuestType, readyToProgress, todayPlan, workoutForWeek } from '@/store/logic';
import { passesUsedThisMonth, REST_PASS_MONTHLY_LIMIT, REST_PASS_PRICE } from '@/store/penalty';
import { REST_DAY_TIPS, WARMUP } from '@/store/program8';
import { useStore } from '@/store/store';
import type { ExerciseTemplate, Workout } from '@/store/types';
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
  const [guide, setGuide] = useState<ExerciseTemplate | null>(null);
  const plan = todayPlan(state);
  const wk = programWeek(state);
  const week = wk?.week ?? null;
  const base: Workout | undefined = state.active
    ? state.workouts.find((w) => w.id === state.active!.workoutId)
    : state.workouts.find((w) => w.id === chosenId) ?? (plan.kind === 'workout' ? plan.workout : undefined);
  const workout = base ? workoutForWeek(base, week) : undefined;
  const isScheduled = plan.kind === 'workout' && base?.id === plan.workout.id;
  const doneToday = plan.kind === 'workout' && plan.done && isScheduled && !state.active;

  const picker = (
    <Sheet visible={pick} onClose={() => setPick(false)} title="Pilih Dungeon">
      <ScrollView style={{ maxHeight: 460 }}>
        {state.workouts.map((w) => (
          <Card
            key={w.id}
            tone={w.id === base?.id ? 'active' : 'default'}
            style={{ marginBottom: 10 }}
            onPress={() => {
              setChosenId(w.id);
              setPick(false);
            }}>
            <Text style={styles.exName}>
              {w.day ? `${DAY_SHORT[w.day].toUpperCase()} · ` : ''}
              {w.name.toUpperCase()}
            </Text>
            <Body size={13}>
              {w.subtitle} · {w.exercises.length} gerakan
            </Body>
          </Card>
        ))}
      </ScrollView>
    </Sheet>
  );

  if (state.workouts.length === 0)
    return (
      <Card style={{ marginTop: 24, alignItems: 'center', gap: 12 }}>
        <Icon name="sword-cross" size={40} color={C.textFaint} />
        <Body center>Belum ada program latihan.</Body>
        <Button label="Pasang Program 8 Minggu" icon="download" onPress={() => actions.installProgram()} />
      </Card>
    );

  if (!workout) {
    // Hari istirahat
    const tomorrow = plan.kind === 'rest' ? plan.tomorrow : null;
    const rested = state.restDays.includes(dayKey());
    return (
      <View style={{ marginTop: 20, gap: 14 }}>
        <SystemNotice />
        <PenaltyCard />
        <WeekBanner />
        <Card tone="success" style={{ alignItems: 'center' }}>
          <Icon name="sleep" size={40} color={C.success} />
          <Text style={[styles.questTitle, { fontSize: 26, lineHeight: 30 }]}>HARI {DAY_NAMES[isoDay()].toUpperCase()} — REST DAY</Text>
          <Body center>Istirahat adalah bagian dari program. Otot tumbuh saat pemulihan.</Body>
          <View style={{ alignSelf: 'stretch', marginTop: 12, gap: 4 }}>
            {REST_DAY_TIPS.map((t) => (
              <Body key={t} size={14} color={C.text}>
                • {t}
              </Body>
            ))}
          </View>
          <Button
            label={rested ? 'Recovery tercatat ✓' : 'Catat Recovery'}
            variant={rested ? 'ghost' : 'success'}
            icon={rested ? 'check' : 'heart-pulse'}
            onPress={() => actions.toggleRestDay()}
            style={{ alignSelf: 'stretch', marginTop: 16 }}
          />
        </Card>
        {tomorrow && (
          <Card>
            <Label>Berikutnya · {tomorrow.day ? `Hari ${DAY_NAMES[tomorrow.day]}` : ''}</Label>
            <Text style={[styles.exName, { marginTop: 6 }]}>{tomorrow.name.toUpperCase()}</Text>
            <Body size={13}>{tomorrow.subtitle}</Body>
          </Card>
        )}
        <Pressable onPress={() => setPick(true)} style={{ alignSelf: 'center' }}>
          <Label color={C.lavender}>+ Tetap latihan hari ini (pilih dungeon)</Label>
        </Pressable>
        {picker}
      </View>
    );
  }

  const sets = state.active?.sets ?? [];
  const finisherMode = workout.exercises[0]?.rx.finisher ?? 'on';
  const start = () => {
    if (!state.active) actions.startSession(base!);
    router.push('/session');
  };

  return (
    <View style={{ marginTop: 20 }}>
      {state.notice || state.penalty ? (
        <View style={{ gap: 10, marginBottom: 14 }}>
          <SystemNotice />
          <PenaltyCard />
        </View>
      ) : null}
      <WeekBanner />
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: doneToday ? C.lavender : C.success }} />
          <Text style={styles.sys}>
            {state.active ? 'DUNGEON IN PROGRESS' : doneToday ? 'DUNGEON HARI INI SELESAI' : isScheduled ? `JADWAL HARI ${DAY_NAMES[isoDay()].toUpperCase()}` : 'DUNGEON TAMBAHAN'}
          </Text>
        </View>
        <Text style={styles.questTitle}>TODAY&apos;S QUEST — {workout.name.toUpperCase()}</Text>
        <Body size={16} center>
          {workout.subtitle}
        </Body>
        {!state.active && state.workouts.length > 1 && (
          <Pressable onPress={() => setPick(true)} style={{ marginTop: 10 }}>
            <Label color={C.lavender}>⇄ Ganti dungeon</Label>
          </Pressable>
        )}
      </View>

      {isScheduled && !doneToday ? (
        <View style={{ marginTop: 18 }}>
          <DeadlineTimer />
        </View>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <InfoCard icon="run" title="Pemanasan 5–8 menit" lines={WARMUP[workout.focus ?? 'upper']} />
      </View>

      <View style={{ gap: 12, marginTop: 12 }}>
        {workout.exercises.map((e, i) => {
          const done = sets.filter((s) => s.exerciseId === e.id).length;
          const pct = Math.min(1, done / e.sets);
          const complete = done >= e.sets;
          const ready = readyToProgress(state.sessions, e);
          return (
            <Card key={e.id} tone={complete ? 'success' : 'default'} onPress={() => setGuide(base!.exercises[i])}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.exIcon, complete && { borderColor: hexA(C.success, 0.4), backgroundColor: hexA(C.success, 0.1) }]}>
                  {complete ? <Icon name="check-circle-outline" color={C.success} size={24} /> : <Text style={styles.exNum}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, complete && { color: C.success }]}>{e.name.toUpperCase()}</Text>
                  <Body size={12} style={{ color: C.textDim }}>
                    {e.muscles.join(' · ')}
                  </Body>
                  <Mono size={12} style={{ marginTop: 6 }} color={complete ? C.success : C.textMuted}>
                    {rxLine(e)}
                  </Mono>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {e.technique && e.rx.techniqueActive && <Tag label={TECH_LABEL[e.technique.kind]} color={C.danger} />}
                    {ready && <Tag label="▲ Siap naik level" color={C.gold} />}
                    {state.active && <Tag label={`${done}/${e.sets} set`} color={complete ? C.success : C.textDim} />}
                  </View>
                </View>
                <Icon name="information-outline" size={20} color={C.textFaint} />
              </View>
              {state.active && !complete && done > 0 && <ProgressBar value={pct} style={{ marginTop: 12 }} height={6} />}
            </Card>
          );
        })}
      </View>

      <View style={{ gap: 10, marginTop: 12 }}>
        {workout.finisher ? (
          <InfoCard
            icon="fire"
            title="Finisher"
            lines={[workout.finisher]}
            muted={finisherMode === 'off'}
            tag={finisherMode === 'off' ? 'SKIP (DELOAD)' : finisherMode === 'optional' ? 'OPSIONAL' : 'WAJIB'}
          />
        ) : null}
        {workout.cooldown ? <InfoCard icon="yoga" title="Pendinginan 5 menit" lines={[workout.cooldown]} /> : null}
      </View>

      {doneToday ? (
        <Card tone="success" style={{ marginTop: 24, alignItems: 'center' }}>
          <Icon name="check-decagram" size={32} color={C.success} />
          <Body center color={C.text} style={{ marginTop: 6 }}>
            Dungeon hari ini sudah selesai. Pulihkan diri — makan, minum, tidur.
          </Body>
          <Button label="Latihan lagi" variant="ghost" size="sm" onPress={start} style={{ marginTop: 12, alignSelf: 'stretch' }} />
        </Card>
      ) : (
        <>
          <Button label={state.active ? 'Resume Dungeon' : 'Enter Dungeon'} icon="sword-cross" size="lg" pill onPress={start} style={{ marginTop: 24 }} />
          {!state.active && isScheduled && <RestPassControl compact />}
        </>
      )}

      {picker}
      <ExerciseGuideSheet exercise={guide} onClose={() => setGuide(null)} />
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
      <Card style={{ marginTop: 6, marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.shopIcon}>
            <Icon name="ticket-outline" size={24} color={C.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shopTitle}>REST PASS</Text>
            <Body size={12}>Izin 1 hari latihan tanpa penalti. Maks {REST_PASS_MONTHLY_LIMIT}× per bulan.</Body>
            <Mono size={12} color={C.textDim} style={{ marginTop: 4 }}>
              Dimiliki: {state.restPasses ?? 0} · bulan ini {passesUsedThisMonth(state)}/{REST_PASS_MONTHLY_LIMIT}
            </Mono>
          </View>
        </View>
        <Button
          label={state.coins >= REST_PASS_PRICE ? `Beli · ${REST_PASS_PRICE} koin` : `Butuh ${REST_PASS_PRICE - state.coins} koin lagi`}
          icon="cart-outline"
          variant={state.coins >= REST_PASS_PRICE ? 'secondary' : 'ghost'}
          size="sm"
          disabled={state.coins < REST_PASS_PRICE}
          onPress={actions.buyRestPass}
          style={{ marginTop: 12 }}
        />
      </Card>
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
  shopIcon: { width: 46, height: 46, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)', backgroundColor: 'rgba(251,191,36,0.08)', alignItems: 'center', justifyContent: 'center' },
  shopTitle: { fontFamily: F.headline, color: C.gold, fontSize: 16, letterSpacing: 1 },
  sys: { fontFamily: F.mono, color: C.success, fontSize: 14, letterSpacing: 1.5 },
  questTitle: { fontFamily: F.display, color: '#ece6ff', fontSize: 32, lineHeight: 38, textAlign: 'center', marginTop: 10, marginBottom: 8 },
  exIcon: { width: 42, height: 42, borderRadius: 10, borderWidth: 1, borderColor: '#3a3448', backgroundColor: '#1b1726', alignItems: 'center', justifyContent: 'center' },
  exName: { fontFamily: F.headline, color: C.text, fontSize: 17, letterSpacing: 0.3 },
  exNum: { fontFamily: F.monoBold, color: C.lavender, fontSize: 18 },
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
