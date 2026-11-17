import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { dayKey } from './dates';
import { initialState, uid } from './defaults';
import { computeSessionXp, QUESTS, questStatus } from './logic';
import type { AppState, Profile, SetLog, Settings, Workout } from './types';

const KEY = 'shadowfit:state:v1';

type Updater = (s: AppState) => AppState;

interface Ctx {
  state: AppState;
  ready: boolean;
  update: (fn: Updater) => void;
  actions: ReturnType<typeof makeActions>;
}

const StoreContext = createContext<Ctx | null>(null);

function makeActions(update: (fn: Updater) => void) {
  return {
    setProfile: (p: Profile) =>
      update((s) => ({
        ...s,
        profile: p,
        weights: s.weights.some((w) => w.date === dayKey()) ? s.weights : [...s.weights, { date: dayKey(), kg: p.weightKg }],
      })),
    patchProfile: (p: Partial<Profile>) => update((s) => (s.profile ? { ...s, profile: { ...s.profile, ...p } } : s)),
    patchSettings: (p: Partial<Settings>) => update((s) => ({ ...s, settings: { ...s.settings, ...p } })),

    startSession: (workout: Workout) =>
      update((s) =>
        s.active
          ? s
          : {
              ...s,
              active: { id: uid(), workoutId: workout.id, workoutName: workout.name, startedAt: new Date().toISOString(), sets: [], xp: 0 },
            },
      ),
    logSet: (set: SetLog) => update((s) => (s.active ? { ...s, active: { ...s.active, sets: [...s.active.sets, set] } } : s)),
    undoLastSet: () => update((s) => (s.active ? { ...s, active: { ...s.active, sets: s.active.sets.slice(0, -1) } } : s)),
    /** Mengembalikan XP yang didapat */
    finishSession: () => {
      let gained = 0;
      update((s) => {
        if (!s.active) return s;
        if (s.active.sets.length === 0) return { ...s, active: null };
        const done = { ...s.active, endedAt: new Date().toISOString() };
        done.xp = computeSessionXp(done);
        gained = done.xp;
        return { ...s, active: null, sessions: [...s.sessions, done] };
      });
      return gained;
    },
    abandonSession: () => update((s) => ({ ...s, active: null })),
    deleteSession: (id: string) => update((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) })),

    logWeight: (kg: number, date = dayKey()) =>
      update((s) => ({
        ...s,
        weights: [...s.weights.filter((w) => w.date !== date), { date, kg }].sort((a, b) => a.date.localeCompare(b.date)),
        profile: s.profile ? { ...s.profile, weightKg: kg } : s.profile,
      })),
    deleteWeight: (date: string) => update((s) => ({ ...s, weights: s.weights.filter((w) => w.date !== date) })),
    addPhoto: (uri: string) => update((s) => ({ ...s, photos: [...s.photos, { id: uid(), uri, date: dayKey() }] })),
    deletePhoto: (id: string) => update((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== id) })),
    toggleRestDay: (date = dayKey()) =>
      update((s) => ({
        ...s,
        restDays: s.restDays.includes(date) ? s.restDays.filter((d) => d !== date) : [...s.restDays, date],
      })),

    acceptQuest: (questId: string) =>
      update((s) => {
        const q = QUESTS.find((x) => x.id === questId);
        if (!q) return s;
        const st = questStatus(s, q);
        if (st.accepted) return s;
        return { ...s, quests: [...s.quests, { questId, period: st.period, claimed: false }] };
      }),
    claimQuest: (questId: string) =>
      update((s) => {
        const q = QUESTS.find((x) => x.id === questId);
        if (!q) return s;
        const st = questStatus(s, q);
        if (!st.accepted || st.claimed || !st.done) return s;
        return {
          ...s,
          bonusXp: s.bonusXp + q.xp,
          coins: s.coins + q.coins,
          quests: s.quests.map((a) => (a.questId === questId && a.period === st.period ? { ...a, claimed: true } : a)),
        };
      }),
    equipTitle: (id: string | null) => update((s) => ({ ...s, equippedTitle: id })),

    saveWorkout: (w: Workout) =>
      update((s) => ({
        ...s,
        workouts: s.workouts.some((x) => x.id === w.id) ? s.workouts.map((x) => (x.id === w.id ? w : x)) : [...s.workouts, w],
      })),
    deleteWorkout: (id: string) => update((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== id) })),
    moveWorkout: (id: string, dir: -1 | 1) =>
      update((s) => {
        const i = s.workouts.findIndex((w) => w.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= s.workouts.length) return s;
        const arr = [...s.workouts];
        [arr[i], arr[j]] = [arr[j], arr[i]];
        return { ...s, workouts: arr };
      }),

    importState: (data: AppState) => update(() => ({ ...initialState(), ...data })),
    resetAll: () => update(() => initialState()),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          const merged = { ...initialState(), ...parsed, settings: { ...initialState().settings, ...parsed.settings } };
          stateRef.current = merged;
          setState(merged);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((fn: Updater) => {
    // Diterapkan sinkron pada ref agar aksi bisa membaca hasilnya langsung
    const next = fn(stateRef.current);
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(stateRef.current)).catch(() => {});
    }, 250);
  }, []);

  const actions = useMemo(() => makeActions(update), [update]);
  const value = useMemo(() => ({ state, ready, update, actions }), [state, ready, update, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
