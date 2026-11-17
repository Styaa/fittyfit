// Penalty Quest & Rest Pass
import { addDays, dayKey, parseDay } from './dates';
import { hasSchedule, isoDay, programWeek, workoutForDay } from './logic';
import type { AppState, Penalty, PenaltyFocus } from './types';

export const REST_PASS_PRICE = 300;
export const REST_PASS_MONTHLY_LIMIT = 2;
export const DEBUFF_SESSIONS = 2;
export const DEBUFF_FACTOR = 0.75;

export interface PenaltyExercise {
  name: string;
  /** nama gerakan di src/anim/moves.ts untuk animasi */
  anim: string;
  reps: number;
  unit: 'reps' | 'reps/sisi' | 'reps/huruf' | 'detik';
}

const PLANK: PenaltyExercise = { name: 'Plank', anim: 'Plank', reps: 30, unit: 'detik' };

export const PENALTY_SETS: Record<PenaltyFocus, PenaltyExercise[]> = {
  push: [
    { name: 'Push-Up', anim: 'Push-Up', reps: 12, unit: 'reps' },
    { name: 'Pike Push-Up', anim: 'Pike Push-Up', reps: 8, unit: 'reps' },
    { name: 'Diamond Push-Up', anim: 'Diamond Push-Up', reps: 6, unit: 'reps' },
    PLANK,
  ],
  pull: [
    { name: 'Superman Pull', anim: 'Superman Pull', reps: 15, unit: 'reps' },
    { name: 'Prone Y-T-W Raise', anim: 'Prone Y-T-W Raise', reps: 10, unit: 'reps/huruf' },
    { name: 'Reverse Snow Angel', anim: 'Reverse Snow Angel', reps: 10, unit: 'reps' },
    PLANK,
  ],
  leg: [
    { name: 'Bodyweight Squat', anim: 'Bodyweight Squat', reps: 20, unit: 'reps' },
    { name: 'Reverse Lunge', anim: 'Bodyweight Reverse Lunge', reps: 10, unit: 'reps/sisi' },
    { name: 'Glute Bridge', anim: 'Glute Bridge', reps: 15, unit: 'reps' },
    PLANK,
  ],
  mixed: [
    { name: 'Push-Up', anim: 'Push-Up', reps: 10, unit: 'reps' },
    { name: 'Bodyweight Squat', anim: 'Bodyweight Squat', reps: 15, unit: 'reps' },
    { name: 'Superman Pull', anim: 'Superman Pull', reps: 10, unit: 'reps' },
    PLANK,
  ],
};

export function focusOf(workoutName: string): PenaltyFocus {
  const n = workoutName.toLowerCase();
  if (n.includes('push')) return 'push';
  if (n.includes('pull')) return 'pull';
  if (n.includes('leg')) return 'leg';
  return 'mixed';
}

/** Ronde penalti mengikuti fase program */
export function roundsForWeek(week: number | null) {
  if (week == null) return 2;
  if (week <= 2) return 2;
  if (week <= 7) return 3;
  return 1; // deload
}

export const profileStart = (st: AppState) => (st.profile ? dayKey(st.profile.createdAt) : dayKey());

/** Hari latihan terjadwal yang terlewat tanpa sesi / Rest Pass */
export function isMissedDay(st: AppState, day: string) {
  if (!hasSchedule(st)) return false;
  if (day < profileStart(st)) return false;
  const w = workoutForDay(st, isoDay(parseDay(day)));
  if (!w) return false;
  if (st.passDays.includes(day)) return false;
  return !st.sessions.some((s) => dayKey(s.startedAt) === day);
}

export const isTrainingDay = (st: AppState, day: string = dayKey()) => hasSchedule(st) && !!workoutForDay(st, isoDay(parseDay(day)));

export function passesUsedThisMonth(st: AppState, at: Date = new Date()) {
  const ym = dayKey(at).slice(0, 7);
  return st.passDays.filter((d) => d.startsWith(ym)).length;
}

/** Bisa memakai Rest Pass hari ini? Kembalikan alasan jika tidak. */
export function restPassBlock(st: AppState, day: string = dayKey()): string | null {
  if (!isTrainingDay(st, day)) return 'Hari ini bukan hari latihan.';
  if (st.passDays.includes(day)) return 'Rest Pass sudah dipakai hari ini.';
  if (st.sessions.some((s) => dayKey(s.startedAt) === day)) return 'Kamu sudah latihan hari ini.';
  if (st.restPasses <= 0) return 'Kamu belum punya Rest Pass.';
  if (passesUsedThisMonth(st, parseDay(day)) >= REST_PASS_MONTHLY_LIMIT) return `Batas ${REST_PASS_MONTHLY_LIMIT} Rest Pass per bulan sudah tercapai.`;
  return null;
}

/**
 * Evaluasi harian: penalti kedaluwarsa → gagal (streak putus + debuff),
 * hari latihan terlewat → penalty quest baru. Mengembalikan state yang sama jika tidak ada perubahan.
 */
export function evaluateDaily(st: AppState, now: Date = new Date()): AppState {
  if (!st.profile) return st;
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));
  let s = st;

  // 1. Penalti hari sebelumnya
  if (s.penalty && s.penalty.activeDate < today) {
    if (s.penalty.status === 'active') {
      s = {
        ...s,
        penalty: null,
        debuffSessions: DEBUFF_SESSIONS,
        notice: {
          kind: 'penalty-failed',
          date: today,
          text: `Penalty Quest gagal diselesaikan. Streak dihapus. Debuff WEAKENED aktif: XP −25% untuk ${DEBUFF_SESSIONS} sesi berikutnya.`,
        },
      };
    } else {
      s = { ...s, penalty: null };
    }
  }

  // 2. Pertama kali dijalankan: masa tenggang, mulai menghitung dari hari ini
  if (!s.lastCheckDay) {
    return { ...s, lastCheckDay: yesterday };
  }

  // 3. Cari hari latihan yang terlewat sejak pengecekan terakhir
  if (s.lastCheckDay < yesterday) {
    const missed: string[] = [];
    let d = addDays(parseDay(s.lastCheckDay), 1);
    while (dayKey(d) <= yesterday) {
      const k = dayKey(d);
      if (isMissedDay(s, k)) missed.push(k);
      d = addDays(d, 1);
    }
    s = { ...s, lastCheckDay: yesterday };
    if (missed.length && !s.penalty) {
      const last = missed[missed.length - 1];
      const w = workoutForDay(s, isoDay(parseDay(last)));
      const wk = programWeek(s, now)?.week ?? null;
      const penalty: Penalty = {
        id: `${today}-${Math.random().toString(36).slice(2, 7)}`,
        missedDates: missed,
        workoutName: w?.name ?? 'Dungeon',
        focus: focusOf(w?.name ?? ''),
        rounds: roundsForWeek(wk),
        roundsDone: 0,
        activeDate: today,
        status: 'active',
      };
      s = {
        ...s,
        penalty,
        notice: {
          kind: 'penalty-new',
          date: today,
          text: `Kamu melewatkan Dungeon: ${penalty.workoutName}. Penalty Quest diaktifkan. Selesaikan sebelum 23:59, atau streak akan dihapus.`,
        },
      };
    }
  }
  return s;
}
