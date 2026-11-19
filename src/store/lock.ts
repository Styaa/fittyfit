// Aturan Lockdown versi JS (cermin dari LockPolicy.kt) — dipakai UI & untuk dikirim ke modul native
import { addDays, dayKey } from './dates';
import { isoDay, workoutForDay } from './logic';
import type { AppState } from './types';

export const EMERGENCY_PHRASE = 'Saya menyerah pada quest hari ini';
export const EMERGENCY_WAIT_SEC = 60;

/** Hari latihan terjadwal (ISO 1–7) */
export const lockDays = (st: AppState) => [1, 2, 3, 4, 5, 6, 7].filter((d) => !!workoutForDay(st, d));

/** Tanggal yang aman dari lockdown: sudah latihan, Rest Pass, atau buka darurat (7 hari terakhir + hari ini) */
export function unlockedDates(st: AppState, now: Date = new Date()): string[] {
  const from = dayKey(addDays(now, -7));
  const set = new Set<string>([...st.passDays, ...st.emergencyUnlocks]);
  st.sessions.forEach((s) => set.add(dayKey(s.startedAt)));
  return [...set].filter((d) => d >= from).sort();
}

export function lockStartToday(st: AppState, now: Date = new Date()) {
  const { hour, minute } = st.settings.lock;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
}

/** Apakah lockdown aktif sekarang (aturan yang sama dengan native) */
export function lockActiveNow(st: AppState, now: Date = new Date()) {
  if (!st.profile || !st.settings.lock.enabled) return false;
  if (!workoutForDay(st, isoDay(now))) return false;
  if (now < lockStartToday(st, now)) return false;
  return !unlockedDates(st, now).includes(dayKey(now));
}

/** Lockdown akan aktif malam ini jika quest belum selesai */
export function lockPendingToday(st: AppState, now: Date = new Date()) {
  if (!st.profile || !st.settings.lock.enabled) return false;
  if (!workoutForDay(st, isoDay(now))) return false;
  return !unlockedDates(st, now).includes(dayKey(now));
}

export const fmtLockTime = (st: AppState) =>
  `${String(st.settings.lock.hour).padStart(2, '0')}.${String(st.settings.lock.minute).padStart(2, '0')}`;

export interface Deadline {
  kind: 'lock' | 'penalty';
  target: Date;
}

/**
 * Batas terdekat hari ini jika dungeon belum selesai:
 * Lockdown (jika aktif & belum lewat jamnya), lalu Penalty Quest di 23.59.
 * null jika bukan hari latihan atau hari ini sudah aman.
 */
export function nextDeadline(st: AppState, now: Date = new Date()): Deadline | null {
  if (!st.profile || !workoutForDay(st, isoDay(now))) return null;
  if (unlockedDates(st, now).includes(dayKey(now))) return null;
  const lockAt = lockStartToday(st, now);
  if (st.settings.lock.enabled && now < lockAt) return { kind: 'lock', target: lockAt };
  return { kind: 'penalty', target: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) };
}
