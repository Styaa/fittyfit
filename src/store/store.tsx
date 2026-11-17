import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { dayKey, parseDay } from './dates';
import { initialState, newProgramInfo, uid } from './defaults';
import { DEBUFF_FACTOR, evaluateDaily, REST_PASS_PRICE, restPassBlock } from './penalty';
import { programWorkouts } from './program8';
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
        let debuffSessions = s.debuffSessions ?? 0;
        if (debuffSessions > 0) {
          done.xp = Math.round(done.xp * DEBUFF_FACTOR);
          done.debuffed = true;
          debuffSessions -= 1;
        }
        gained = done.xp;
        return { ...s, active: null, sessions: [...s.sessions, done], debuffSessions };
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

    installProgram: () => update((s) => ({ ...s, workouts: programWorkouts(), program: newProgramInfo() })),
    restartProgram: () => update((s) => ({ ...s, program: newProgramInfo() })),
    /** geser minggu program: +1 = maju satu minggu */
    shiftProgramWeek: (delta: number) =>
      update((s) => {
        if (!s.program) return s;
        const d = parseDay(s.program.startDate);
        d.setDate(d.getDate() - delta * 7);
        if (d > new Date()) return s;
        return { ...s, program: { ...s.program, startDate: dayKey(d) } };
      }),

    /** evaluasi harian penalti (aman dipanggil berkali-kali) */
    evaluate: () => update((s) => evaluateDaily(s)),
    dismissNotice: () => update((s) => ({ ...s, notice: null })),
    penaltyRoundDone: () =>
      update((s) => {
        const p = s.penalty;
        if (!p || p.status !== 'active') return s;
        const roundsDone = p.roundsDone + 1;
        if (roundsDone < p.rounds) return { ...s, penalty: { ...p, roundsDone } };
        return {
          ...s,
          penalty: { ...p, roundsDone, status: 'cleared' },
          clearedDays: [...new Set([...(s.clearedDays ?? []), ...p.missedDates])],
          notice: { kind: 'penalty-cleared', date: dayKey(), text: 'Penalty Quest selesai. Streak dipulihkan. Kembali ke jalur, Hunter.' },
        };
      }),
    penaltyRoundUndo: () =>
      update((s) => (s.penalty && s.penalty.status === 'active' && s.penalty.roundsDone > 0 ? { ...s, penalty: { ...s.penalty, roundsDone: s.penalty.roundsDone - 1 } } : s)),
    buyRestPass: () =>
      update((s) => (s.coins >= REST_PASS_PRICE ? { ...s, coins: s.coins - REST_PASS_PRICE, restPasses: (s.restPasses ?? 0) + 1 } : s)),
    useRestPass: () => {
      let err: string | null = null;
      update((s) => {
        err = restPassBlock(s);
        if (err) return s;
        return { ...s, restPasses: s.restPasses - 1, passDays: [...s.passDays, dayKey()] };
      });
      return err;
    },
    patchLock: (p: Partial<Settings['lock']>) => update((s) => ({ ...s, settings: { ...s.settings, lock: { ...s.settings.lock, ...p } } })),
    /** buka darurat: lockdown hari ini dibuka (penalti besok tetap berlaku) */
    emergencyUnlock: () =>
      update((s) => (s.emergencyUnlocks.includes(dayKey()) ? s : { ...s, emergencyUnlocks: [...s.emergencyUnlocks, dayKey()].slice(-30) })),
    patchNotif: (p: Partial<Settings['notif']>) => update((s) => ({ ...s, settings: { ...s.settings, notif: { ...s.settings.notif, ...p } } })),

    importState: (data: AppState) =>
      update(() => {
        const init = initialState();
        return {
          ...init,
          ...data,
          settings: { ...init.settings, ...data.settings, notif: { ...init.settings.notif, ...(data.settings?.notif ?? {}) }, lock: { ...init.settings.lock, ...(data.settings?.lock ?? {}) } },
        };
      }),
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
          const init = initialState();
          const merged: AppState = {
            ...init,
            ...parsed,
            settings: {
              ...init.settings,
              ...parsed.settings,
              notif: { ...init.settings.notif, ...(parsed.settings?.notif ?? {}) },
              lock: { ...init.settings.lock, ...(parsed.settings?.lock ?? {}) },
            },
          };
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
