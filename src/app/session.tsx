import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ring } from '@/components/charts';
import { ExerciseGuideSheet, InfoCard, rxLine, TECH_LABEL, WeekBanner } from '@/components/program';
import { Body, Button, Card, Icon, IconButton, Label, Mono, ProgressBar, Screen, Sheet, Stepper, Tag, TopBar } from '@/components/ui';
import { fmtClock } from '@/store/dates';
import {
  applyWeek,
  computeSessionXp,
  programWeek,
  workoutForWeek,
  fmtBig,
  fmtLoad,
  fromUnit,
  levelInfo,
  parseTempo,
  personalRecords,
  PHASE_NAMES,
  PHASES,
  sessionVolume,
  toUnit,
  totalXp,
} from '@/store/logic';
import { WARMUP } from '@/store/program8';
import { useStore } from '@/store/store';
import type { ExerciseTemplate } from '@/store/types';
import { C, F, glow, hexA } from '@/theme';

function goHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

type WkEx = ReturnType<typeof applyWeek>;

/** Workout aktif dengan resep minggu saat sesi dimulai */
function useSessionWorkout() {
  const { state } = useStore();
  const active = state.active;
  const base = state.workouts.find((w) => w.id === active?.workoutId);
  return useMemo(() => {
    if (!base || !active) return { workout: undefined, week: null as number | null };
    const week = programWeek(state, new Date(active.startedAt))?.week ?? null;
    return { workout: workoutForWeek(base, week), week };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, active?.startedAt, state.program]);
}

type Phase = 'overview' | 'set' | 'rest' | 'summary';

function useNow(active: boolean, ms = 200) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

function confirm(title: string, msg: string, onOk: () => void) {
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

function useSafeKeepAwake() {
  useEffect(() => {
    const tag = 'shadowfit-session';
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      Promise.resolve()
        .then(() => deactivateKeepAwake(tag))
        .catch(() => {});
    };
  }, []);
}

export default function SessionScreen() {
  useSafeKeepAwake();
  const { state, actions } = useStore();
  const active = state.active;
  const { workout } = useSessionWorkout();
  const [phase, setPhase] = useState<Phase>('overview');
  const [exId, setExId] = useState<string | null>(null);
  const [restEnd, setRestEnd] = useState(0);
  const [summary, setSummary] = useState<null | { xp: number; volume: number; sets: number; minutes: number; prs: string[]; levelUp: boolean; level: number }>(null);

  const haptic = (kind: 'light' | 'heavy' | 'success') => {
    if (!state.settings.haptics || Platform.OS === 'web') return;
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else Haptics.impactAsync(kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  if (phase === 'summary' && summary) return <Summary data={summary} />;

  if (!active || !workout) {
    return (
      <Screen header={<TopBar left={<IconButton name="chevron-left" onPress={() => router.back()} />} title="Dungeon" />}>
        <Card style={{ alignItems: 'center', gap: 12 }}>
          <Body center>Tidak ada dungeon aktif.</Body>
          <Button label="Kembali" onPress={() => goHome()} />
        </Card>
      </Screen>
    );
  }

  const exercise = workout.exercises.find((e) => e.id === exId);
  const doneOf = (id: string) => active.sets.filter((s) => s.exerciseId === id).length;

  const finish = () => {
    const xpBefore = totalXp(state);
    const before = personalRecords(state.sessions);
    const after = personalRecords([...state.sessions, active]);
    const oldMap = new Map(before.map((p) => [p.name.toLowerCase(), p.e1rm]));
    const prs = after.filter((p) => p.e1rm > (oldMap.get(p.name.toLowerCase()) ?? 0) && active.sets.some((s) => s.at === p.date)).map((p) => p.name);
    const xp = computeSessionXp(active);
    const lvBefore = levelInfo(xpBefore).level;
    const lvAfter = levelInfo(xpBefore + xp).level;
    setSummary({
      xp,
      volume: sessionVolume(active),
      sets: active.sets.length,
      minutes: Math.round((Date.now() - new Date(active.startedAt).getTime()) / 60000),
      prs,
      levelUp: lvAfter > lvBefore,
      level: lvAfter,
    });
    actions.finishSession();
    haptic('success');
    setPhase('summary');
  };

  const onSetLogged = (e: ExerciseTemplate) => {
    const done = doneOf(e.id) + 1; // termasuk set yang baru dicatat
    haptic('success');
    if (done < e.sets) {
      setRestEnd(Date.now() + e.restSec * 1000);
      setPhase('rest');
    } else {
      // pilih latihan berikutnya yang belum selesai
      const nextEx = workout.exercises.find((x) => x.id !== e.id && doneOf(x.id) < x.sets);
      if (nextEx) {
        setExId(nextEx.id);
        setRestEnd(Date.now() + e.restSec * 1000);
        setPhase('rest');
      } else setPhase('overview');
    }
  };

  if (phase === 'set' && exercise) {
    return (
      <SetScreen
        key={exercise.id + doneOf(exercise.id)}
        exercise={exercise}
        setIndex={doneOf(exercise.id) + 1}
        onClose={() => setPhase('overview')}
        onLogged={() => onSetLogged(exercise)}
        haptic={haptic}
      />
    );
  }

  if (phase === 'rest' && exercise) {
    return (
      <RestScreen
        exercise={exercise}
        setIndex={doneOf(exercise.id) + 1}
        restEnd={restEnd}
        setRestEnd={setRestEnd}
        workoutName={workout.name}
        onStart={() => setPhase('set')}
        onBack={() => setPhase('overview')}
        haptic={haptic}
      />
    );
  }

  return (
    <Overview
      onPick={(id) => {
        setExId(id);
        setPhase('set');
      }}
      onFinish={() => {
        if (active.sets.length === 0)
          return confirm('Tinggalkan dungeon?', 'Belum ada set yang dicatat. Sesi ini akan dibatalkan.', () => {
            actions.abandonSession();
            goHome();
          });
        const remaining = workout.exercises.reduce((a, e) => a + Math.max(0, e.sets - doneOf(e.id)), 0);
        if (remaining > 0) confirm('Selesaikan dungeon?', `Masih ada ${remaining} set tersisa. Selesaikan sekarang?`, finish);
        else finish();
      }}
    />
  );
}

// ================= OVERVIEW =================
function Overview({ onPick, onFinish }: { onPick: (id: string) => void; onFinish: () => void }) {
  const { state, actions } = useStore();
  const active = state.active!;
  const { workout: wk, week } = useSessionWorkout();
  const workout = wk!;
  const [guide, setGuide] = useState<WkEx | null>(null);
  const finisherMode = workout.exercises[0]?.rx.finisher ?? 'on';
  const now = useNow(true, 1000);
  const elapsed = (now - new Date(active.startedAt).getTime()) / 1000;
  const unit = state.settings.unit;

  return (
    <Screen
      padBottom={40}
      header={
        <TopBar
          left={<IconButton name="chevron-left" onPress={() => router.back()} />}
          title={`Dungeon: ${workout.name}`}
          right={active.sets.length > 0 ? <IconButton name="undo-variant" color={C.textDim} onPress={() => actions.undoLastSet()} /> : null}
        />
      }>
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.success }} />
          <Text style={styles.sys}>SYSTEM STATUS: ONLINE</Text>
        </View>
        <Text style={styles.bigTitle}>TODAY&apos;S QUEST — {workout.name.toUpperCase()}</Text>
        <Body size={17}>{workout.subtitle}</Body>
        <View style={styles.timerPill}>
          <Icon name="timer-outline" color={C.danger} size={22} />
          <Text style={styles.timerText}>{fmtClock(elapsed).padStart(8, '00:')}</Text>
        </View>
      </View>

      {week != null && (
        <View style={{ marginTop: 24 }}>
          <WeekBanner />
        </View>
      )}
      <View style={{ marginTop: 12 }}>
        <InfoCard icon="run" title="Pemanasan 5–8 menit" lines={WARMUP[workout.focus ?? 'upper']} />
      </View>

      <View style={{ gap: 14, marginTop: 14 }}>
        {workout.exercises.map((e) => {
          const sets = active.sets.filter((s) => s.exerciseId === e.id);
          const done = sets.length;
          const complete = done >= e.sets;
          const pct = Math.min(1, done / e.sets);
          return (
            <Card key={e.id} tone={complete ? 'success' : 'default'} onPress={() => onPick(e.id)}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View style={[styles.exIcon, complete && { borderColor: hexA(C.success, 0.4), backgroundColor: hexA(C.success, 0.1) }]}>
                  <Icon name={complete ? 'check-circle-outline' : e.attr === 'END' ? 'hand-back-right-outline' : 'dumbbell'} color={complete ? C.success : C.lavender} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, complete && { color: C.success }]}>{e.name.toUpperCase()}</Text>
                  <Mono size={13} style={{ marginTop: 4, letterSpacing: 1 }} color={complete ? C.success : C.textDim}>
                    {complete ? `COMPLETED · ${done} SETS` : rxLine(e)}
                  </Mono>
                  {!complete && e.technique && e.rx.techniqueActive && <Tag label={TECH_LABEL[e.technique.kind]} color={C.danger} style={{ marginTop: 8 }} />}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Tag label={`${Math.round(pct * 100)}%`} color={complete ? C.success : C.lavender} />
                  <IconButton name="information-outline" size={20} color={C.textFaint} onPress={() => setGuide(e)} />
                </View>
              </View>
              {!complete && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                    <Label color={C.textMuted}>Progress</Label>
                    <Label color={C.textMuted}>
                      {done}/{e.sets} sets
                    </Label>
                  </View>
                  <ProgressBar value={pct} height={6} style={{ marginTop: 8 }} />
                </>
              )}
              {sets.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {sets.map((s, i) => (
                    <Tag key={i} label={`${fmtLoad(s.loadKg, unit)}${unit} × ${s.reps}`} color={complete ? C.success : C.textMuted} />
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <View style={{ gap: 10, marginTop: 14 }}>
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

      <Button label="Complete Dungeon" icon="flag-checkered" size="lg" onPress={onFinish} style={{ marginTop: 28 }} />
      <ExerciseGuideSheet exercise={guide} onClose={() => setGuide(null)} />
      <Body center size={13} style={{ marginTop: 10, color: C.textDim }}>
        Ketuk latihan untuk memulai set berikutnya.
      </Body>
    </Screen>
  );
}

// ================= SET (TEMPO TIMER) =================
function SetScreen({
  exercise: e,
  setIndex,
  onClose,
  onLogged,
  haptic,
}: {
  exercise: WkEx;
  setIndex: number;
  onClose: () => void;
  onLogged: () => void;
  haptic: (k: 'light' | 'heavy' | 'success') => void;
}) {
  const { state, actions } = useStore();
  const unit = state.settings.unit;
  const tempo = useMemo(() => parseTempo(e.tempo), [e.tempo]);
  const cycle = tempo ? tempo.reduce((a, b) => a + b, 0) : 0;

  const [countdownEnd, setCountdownEnd] = useState(Date.now() + 3000);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(0);
  const pausedAt = useRef(0);
  const pausedTotal = useRef(0);
  const [logOpen, setLogOpen] = useState(false);
  const now = useNow(!paused && !logOpen, 100);
  const [guideOpen, setGuideOpen] = useState(false);
  const hold = e.mode === 'hold';
  const lastSet = setIndex >= e.sets;
  const techNow = lastSet && e.technique && e.rx.techniqueActive ? e.technique : null;

  // set sebelumnya untuk beban default
  const prev = [...(state.active?.sets ?? [])].reverse().find((s) => s.exerciseId === e.id);
  const lastEver = [...state.sessions].reverse().flatMap((s) => [...s.sets].reverse()).find((s) => s.exerciseName === e.name);
  const [reps, setReps] = useState(e.repMax);
  const [load, setLoad] = useState(toUnit(prev?.loadKg ?? lastEver?.loadKg ?? e.load, unit));
  const [rir, setRir] = useState(e.rir);

  // hitung mundur 3 detik sebelum mulai
  const countdown = Math.ceil((countdownEnd - now) / 1000);
  useEffect(() => {
    if (!running && countdownEnd > 0 && now >= countdownEnd) {
      startRef.current = countdownEnd;
      setRunning(true);
      haptic('heavy');
    }
  }, [now, countdownEnd, running, haptic]);

  const elapsedMs = running ? (paused ? pausedAt.current : now) - startRef.current - pausedTotal.current : 0;
  const elapsed = Math.max(0, elapsedMs / 1000);

  // fase tempo
  let phaseIdx = -1;
  let phaseProgress = 0;
  let repsDone = 0;
  if (tempo && running) {
    repsDone = Math.floor(elapsed / cycle);
    let t = elapsed % cycle;
    for (let i = 0; i < 4; i++) {
      if (tempo[i] === 0) continue;
      if (t < tempo[i]) {
        phaseIdx = i;
        phaseProgress = t / tempo[i];
        break;
      }
      t -= tempo[i];
    }
  }

  const lastPhase = useRef(-1);
  useEffect(() => {
    if (!running || !state.settings.tempoCue) return;
    if (phaseIdx !== lastPhase.current) {
      if (lastPhase.current !== -1) haptic(phaseIdx === 0 || (tempo && tempo[0] === 0 && phaseIdx === 2) ? 'heavy' : 'light');
      lastPhase.current = phaseIdx;
    }
  }, [phaseIdx, running, state.settings.tempoCue, haptic, tempo]);

  const togglePause = () => {
    if (!running) return;
    if (paused) {
      pausedTotal.current += Date.now() - pausedAt.current;
      setPaused(false);
    } else {
      pausedAt.current = Date.now();
      setPaused(true);
    }
  };

  const openLog = () => {
    if (running && !paused) {
      pausedAt.current = Date.now();
      setPaused(true);
    }
    if (hold && elapsed > 0) setReps(Math.round(elapsed));
    else if (tempo && repsDone > 0) setReps(repsDone);
    setCountdownEnd(0);
    setLogOpen(true);
  };

  const save = () => {
    actions.logSet({
      exerciseId: e.id,
      exerciseName: e.name,
      attr: e.attr,
      setIndex,
      reps: Math.max(0, Math.round(reps)),
      loadKg: Math.max(0, fromUnit(load, unit)),
      rir,
      tutSec: Math.round(elapsed),
      at: new Date().toISOString(),
    });
    setLogOpen(false);
    onLogged();
  };

  const ringProgress = !running
    ? 1 - Math.max(0, countdownEnd - now) / 3000
    : hold
      ? Math.min(1, elapsed / e.repMax)
      : tempo
        ? phaseProgress
        : (elapsed % 60) / 60;
  const holdReached = hold && elapsed >= e.repMin;

  return (
    <Screen
      scroll={false}
      header={
        <TopBar
          left={<IconButton name="close" color={C.textMuted} onPress={onClose} />}
          title={
            <View style={{ alignItems: 'center' }}>
              <Text numberOfLines={2} adjustsFontSizeToFit style={styles.setTitle}>
                {e.name.toUpperCase()} — SET {setIndex}/{e.sets}
              </Text>
              {e.perSide ? <Label color={C.textDim}>Per sisi · kiri & kanan</Label> : null}
            </View>
          }
          right={<IconButton name="information-outline" color={C.textDim} onPress={() => setGuideOpen(true)} />}
        />
      }>
      {tempo ? (
        <View style={styles.phases}>
          {PHASES.map((p, i) => {
            const on = i === phaseIdx;
            const past = phaseIdx > i;
            return (
              <React.Fragment key={i}>
                {i > 0 && <View style={[styles.phaseLine, (past || on) && { backgroundColor: C.lavender }]} />}
                <View style={{ alignItems: 'center', gap: 8, width: 58 }}>
                  <View style={[styles.phaseDot, on && styles.phaseDotOn, tempo[i] === 0 && { opacity: 0.35 }]}>
                    <Text style={[styles.phaseNum, on && { color: '#2a1366' }]}>{tempo[i]}</Text>
                  </View>
                  <Text style={[styles.phaseLabel, on && { color: C.lavender }]}>{p}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      ) : (
        <View style={{ height: 16 }} />
      )}

      {techNow ? (
        <View style={styles.techBanner}>
          <Icon name="skull-outline" size={18} color={C.danger} />
          <View style={{ flex: 1 }}>
            <Label color={C.danger}>Set terakhir · {TECH_LABEL[techNow.kind]}</Label>
            <Body size={12} color={C.text}>
              {techNow.note}
            </Body>
          </View>
        </View>
      ) : null}

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View>
          <Ring size={270} progress={ringProgress} stroke={8}>
            {!running ? (
              <>
                <Text style={styles.countdown}>{Math.max(1, countdown)}</Text>
                <View style={styles.phasePill}>
                  <Text style={styles.phasePillText}>GET READY</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.ringClock}>{fmtClock(elapsed)}</Text>
                <View style={styles.phasePill}>
                  <Text style={[styles.phasePillText, holdReached && { color: C.success }]}>
                    {paused ? 'PAUSED' : hold ? (holdReached ? 'TARGET TERCAPAI' : 'TAHAN') : tempo && phaseIdx >= 0 ? PHASE_NAMES[phaseIdx] : 'TIME UNDER TENSION'}
                  </Text>
                </View>
              </>
            )}
          </Ring>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={{ flex: 1 }}>
          <Label color={C.textMuted}>Progress</Label>
          <Text style={styles.reps}>
            {hold
              ? `${Math.floor(elapsed)}/${e.repMin}–${e.repMax}s`
              : `${e.mode === 'amrap' ? 'AMRAP ' : 'REPS '}${tempo ? repsDone : '—'}/${e.mode === 'amrap' ? `${e.repMin}+` : e.repMax}`}
          </Text>
        </View>
        <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: C.borderMuted, marginHorizontal: 12 }} />
        <View style={{ alignItems: 'flex-end' }}>
          <Label color={C.textMuted}>RIR Target</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Text style={styles.reps}>{hold ? '—' : (e.rirLabel ?? e.rir).toString().split(' ')[0]}</Text>
            {!hold && e.rir <= 1 && <Icon name="skull-outline" color={C.danger} size={26} />}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Pressable onPress={togglePause} disabled={!running} style={[styles.pauseBtn, !running && { opacity: 0.4 }]}>
          <Icon name={paused ? 'play' : 'pause'} color={C.lavender} size={28} />
        </Pressable>
        <Button label="Complete Set" size="lg" onPress={openLog} style={{ flex: 1, height: 64 }} />
      </View>

      <Sheet visible={logOpen} onClose={() => setLogOpen(false)} title={`Log Set ${setIndex}`}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Stepper label={hold ? 'Detik' : e.perSide ? 'Reps / sisi' : 'Reps'} value={reps} onChange={setReps} step={hold ? 5 : 1} />
          <Stepper label={`Load (${unit})`} value={load} onChange={setLoad} step={unit === 'kg' ? 2.5 : 5} decimals={1} />
        </View>
        <Label style={{ marginTop: 18, marginBottom: 10 }}>Reps in reserve (RIR)</Label>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[0, 1, 2, 3, 4].map((n) => (
            <Pressable
              key={n}
              onPress={() => setRir(n)}
              style={[styles.rirBtn, rir === n && { borderColor: n === 0 ? C.danger : C.lavender, backgroundColor: n === 0 ? C.dangerDim : C.primaryDim }]}>
              <Text style={[styles.rirText, rir === n && { color: n === 0 ? C.danger : C.lavender }]}>{n === 4 ? '4+' : n}</Text>
            </Pressable>
          ))}
        </View>
        <Body size={12} style={{ marginTop: 8, color: C.textDim }}>
          RIR 0 = gagal (failure). Time under tension: {Math.round(elapsed)} detik.
        </Body>
        <Button label="Save Set" icon="check" size="lg" onPress={save} style={{ marginTop: 20 }} />
      </Sheet>
      <ExerciseGuideSheet exercise={guideOpen ? e : null} onClose={() => setGuideOpen(false)} />
    </Screen>
  );
}

// ================= REST =================
function RestScreen({
  exercise: e,
  setIndex,
  restEnd,
  setRestEnd,
  workoutName,
  onStart,
  onBack,
  haptic,
}: {
  exercise: ExerciseTemplate;
  setIndex: number;
  restEnd: number;
  setRestEnd: (n: number) => void;
  workoutName: string;
  onStart: () => void;
  onBack: () => void;
  haptic: (k: 'light' | 'heavy' | 'success') => void;
}) {
  const { state } = useStore();
  const unit = state.settings.unit;
  const now = useNow(true, 250);
  const left = Math.max(0, (restEnd - now) / 1000);
  const done = left <= 0;
  const fired = useRef(false);
  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      haptic('heavy');
    }
    if (!done) fired.current = false;
  }, [done, haptic]);

  const prev = [...(state.active?.sets ?? [])].reverse().find((s) => s.exerciseId === e.id);
  const lastEver = [...state.sessions].reverse().flatMap((s) => [...s.sets].reverse()).find((s) => s.exerciseName === e.name);
  const loadKg = prev?.loadKg ?? lastEver?.loadKg ?? e.load;

  return (
    <Screen
      scroll={false}
      header={<TopBar left={<IconButton name="chevron-left" onPress={onBack} />} title={`Active Quest: ${workoutName}`} />}>
      <View style={{ alignItems: 'center', marginTop: 48 }}>
        <View>
          <Text style={[styles.restClock, done && { color: C.success }]}>{fmtClock(Math.ceil(left))}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.success }} />
          <Text style={styles.restLabel}>{done ? 'REST COMPLETE — READY' : 'REST PHASE ACTIVE'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <Button label="+15s" variant="ghost" size="sm" onPress={() => setRestEnd(Math.max(Date.now(), restEnd) + 15000)} style={{ width: 90 }} />
          <Button label="Skip" variant="ghost" size="sm" onPress={() => setRestEnd(Date.now())} style={{ width: 90 }} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 14, marginTop: 40 }}>
        <View style={styles.miniCard}>
          <Label color={C.textMuted}>Current set</Label>
          <Text style={styles.miniVal}>
            {setIndex}
            <Text style={{ color: C.textFaint, fontSize: 18 }}> /{e.sets}</Text>
          </Text>
        </View>
        <View style={styles.miniCard}>
          <Label color={C.textMuted}>Target reps</Label>
          <Text style={[styles.miniVal, { color: C.text }]}>
            {e.repMin === e.repMax ? e.repMax : `${e.repMin}-${e.repMax}`}
            <Text style={{ color: C.textFaint, fontSize: 14 }}>{e.mode === 'hold' ? ' dtk' : e.perSide ? ' /sisi' : ''}</Text>
          </Text>
        </View>
      </View>

      <Card style={{ marginTop: 20 }}>
        <Text style={[styles.exName, { marginBottom: 6 }]}>{e.name.toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="dumbbell" color={C.lavender} size={30} />
          <Text style={styles.loadLabel}>LOAD</Text>
          <Text style={styles.loadVal}>{fmtLoad(loadKg, unit)}</Text>
          <Text style={styles.loadUnit}>{unit.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {e.muscles.map((m, i) => (
            <View key={m} style={[styles.muscle, i > 1 && { backgroundColor: 'transparent', borderColor: C.borderMuted }]}>
              <Text style={styles.muscleText}>
                {i === 0 ? <Text style={{ color: C.textDim }}>[{e.attr}] </Text> : null}
                {m.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ flex: 1 }} />
      <Button label={done ? `Start Set ${setIndex}` : 'Start Set Now'} icon="check" size="lg" onPress={onStart} style={{ height: 64 }} />
    </Screen>
  );
}

// ================= SUMMARY =================
function Summary({ data }: { data: { xp: number; volume: number; sets: number; minutes: number; prs: string[]; levelUp: boolean; level: number } }) {
  return (
    <Screen padBottom={40}>
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text style={styles.sys}>DUNGEON CLEARED</Text>
        <Text style={[styles.bigTitle, { color: data.levelUp ? C.success : '#ece6ff' }]}>{data.levelUp ? `LEVEL UP!\nLV. ${data.level}` : 'QUEST COMPLETE'}</Text>
        <View style={[styles.xpBadge, glow(C.success, 24, 0.35)]}>
          <Icon name="diamond-stone" color={C.success} size={26} />
          <Text style={styles.xpText}>+{data.xp} XP</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
        {[
          { l: 'Volume', v: fmtBig(data.volume) + ' kg' },
          { l: 'Sets', v: String(data.sets) },
          { l: 'Durasi', v: data.minutes + 'm' },
        ].map((x) => (
          <View key={x.l} style={[styles.miniCard, { padding: 14 }]}>
            <Label>{x.l}</Label>
            <Text style={[styles.miniVal, { fontSize: 22 }]}>{x.v}</Text>
          </View>
        ))}
      </View>
      {data.prs.length > 0 && (
        <Card tone="success" style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <Icon name="trophy-outline" color={C.success} />
            <Label color={C.success}>New limits broken</Label>
          </View>
          {data.prs.map((p) => (
            <Body key={p} color={C.text}>
              • {p}
            </Body>
          ))}
        </Card>
      )}
      <Button label="Return to Status" size="lg" onPress={() => goHome()} style={{ marginTop: 32 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sys: { fontFamily: F.mono, color: C.success, fontSize: 14, letterSpacing: 1.5 },
  bigTitle: { fontFamily: F.display, color: '#ece6ff', fontSize: 32, lineHeight: 38, textAlign: 'center', marginTop: 10, marginBottom: 8 },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: hexA(C.danger, 0.45),
    backgroundColor: 'rgba(120,30,40,0.35)',
    borderRadius: 999,
    paddingHorizontal: 28,
    height: 56,
  },
  timerText: { fontFamily: F.monoBold, color: '#fca5a5', fontSize: 26, letterSpacing: 2 },
  exIcon: { width: 50, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#3a3448', backgroundColor: '#1b1726', alignItems: 'center', justifyContent: 'center' },
  exName: { fontFamily: F.headline, color: C.text, fontSize: 19, letterSpacing: 0.3 },
  setTitle: { fontFamily: F.display, color: C.lavenderSoft, fontSize: 19, textAlign: 'center', letterSpacing: -0.3, textShadowColor: 'rgba(196,181,253,0.5)', textShadowRadius: 10 },
  techBanner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 14,
    borderWidth: 1,
    borderColor: hexA(C.danger, 0.4),
    backgroundColor: 'rgba(248,113,113,0.07)',
    borderRadius: 10,
    padding: 12,
  },
  phases: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 28 },
  phaseLine: { width: 28, height: 4, borderRadius: 2, backgroundColor: '#2a2535', marginTop: 16, marginHorizontal: -4 },
  phaseDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#3a3448', backgroundColor: '#211d2c', alignItems: 'center', justifyContent: 'center' },
  phaseDotOn: { backgroundColor: C.lavender, borderColor: C.lavender, ...glow(C.primary, 14, 0.7) },
  phaseNum: { fontFamily: F.mono, color: C.text, fontSize: 15 },
  phaseLabel: { fontFamily: F.title, color: C.textMuted, fontSize: 12, letterSpacing: 1.6 },
  countdown: { fontFamily: F.display, color: C.lavender, fontSize: 96, lineHeight: 104 },
  ringClock: { fontFamily: F.display, color: C.lavenderSoft, fontSize: 58, lineHeight: 64, textShadowColor: 'rgba(196,181,253,0.5)', textShadowRadius: 14 },
  phasePill: { borderWidth: 1, borderColor: '#4a4458', backgroundColor: 'rgba(40,34,56,0.8)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 6, marginTop: 6 },
  phasePillText: { fontFamily: F.title, color: C.textMuted, fontSize: 13, letterSpacing: 2 },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  reps: { fontFamily: F.title, color: C.text, fontSize: 30, marginTop: 4 },
  pauseBtn: { width: 84, height: 64, borderRadius: 14, borderWidth: 1.5, borderColor: C.lavender, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  rirBtn: { flex: 1, height: 48, borderRadius: 8, borderWidth: 1, borderColor: C.borderMuted, alignItems: 'center', justifyContent: 'center' },
  rirText: { fontFamily: F.monoBold, fontSize: 18, color: C.textMuted },
  restClock: { fontFamily: F.title, color: C.lavenderSoft, fontSize: 110, lineHeight: 120, textShadowColor: 'rgba(196,181,253,0.55)', textShadowRadius: 24 },
  restLabel: { fontFamily: F.title, color: C.success, fontSize: 15, letterSpacing: 2.2 },
  miniCard: { flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 14, padding: 18, alignItems: 'center' },
  miniVal: { fontFamily: F.monoBold, color: C.lavender, fontSize: 30, marginTop: 6 },
  loadLabel: { fontFamily: F.headline, color: C.text, fontSize: 26, marginLeft: 14, flex: 1 },
  loadVal: { fontFamily: F.title, color: C.lavender, fontSize: 48 },
  loadUnit: { fontFamily: F.title, color: C.textMuted, fontSize: 14, letterSpacing: 2, marginLeft: 6, marginTop: 18 },
  muscle: { borderWidth: 1, borderColor: '#4a3d7c', backgroundColor: '#2a2245', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  muscleText: { fontFamily: F.title, color: C.textMuted, fontSize: 13, letterSpacing: 1.8 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, borderWidth: 1, borderColor: hexA(C.success, 0.5), backgroundColor: C.successDim, borderRadius: 999, paddingHorizontal: 26, height: 56 },
  xpText: { fontFamily: F.monoBold, color: C.success, fontSize: 24 },
});
