import { addDays, dayKey, parseDay, weekKey, weekStart } from './dates';
import { PROGRAM_WEEKS, weekPhase } from './program8';
import type { AppState, Attr, ExerciseTemplate, Rank, Session, SetLog, Unit, Workout } from './types';

// ---------- Satuan ----------
export const KG_TO_LBS = 2.20462;
export const toUnit = (kg: number, unit: Unit) => (unit === 'kg' ? kg : kg * KG_TO_LBS);
export const fromUnit = (v: number, unit: Unit) => (unit === 'kg' ? v : v / KG_TO_LBS);
export const fmtLoad = (kg: number, unit: Unit) => {
  const v = toUnit(kg, unit);
  return (Math.round(v * 10) / 10).toString();
};
export const fmtBig = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(Math.round(n));

// ---------- Tempo ----------
export const PHASES = ['ECC', 'PAUSE', 'CON', 'PAUSE'] as const;
export const PHASE_NAMES = ['ECCENTRIC PHASE', 'BOTTOM PAUSE', 'CONCENTRIC PHASE', 'TOP PAUSE'];
export function parseTempo(t: string): number[] | null {
  if (!t || t.length !== 4) return null;
  const arr = t.split('').map((c) => (c.toUpperCase() === 'X' ? 1 : parseInt(c, 10)));
  if (arr.some((n) => isNaN(n))) return null;
  if (arr.reduce((a, b) => a + b, 0) === 0) return null;
  return arr;
}

// ---------- Volume / XP ----------
export const setVolume = (s: SetLog) => s.loadKg * s.reps;
export const sessionVolume = (s: Session) => s.sets.reduce((a, x) => a + setVolume(x), 0);
export const sessionTut = (s: Session) => s.sets.reduce((a, x) => a + x.tutSec, 0);

export function computeSessionXp(s: Session) {
  return 50 + s.sets.length * 10 + Math.floor(sessionVolume(s) / 100);
}

export const totalXp = (st: AppState) => st.sessions.reduce((a, s) => a + s.xp, 0) + st.bonusXp;

export const xpForLevel = (level: number) => 250 * level;

export function levelInfo(xp: number) {
  let level = 1;
  let rest = xp;
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level);
    level++;
  }
  return { level, current: rest, needed: xpForLevel(level) };
}

export function rankFor(level: number): Rank {
  if (level >= 70) return 'S';
  if (level >= 50) return 'A';
  if (level >= 35) return 'B';
  if (level >= 20) return 'C';
  if (level >= 10) return 'D';
  return 'E';
}

// ---------- Streak ----------
export function trainingDays(st: AppState): Set<string> {
  return new Set(st.sessions.map((s) => dayKey(s.startedAt)));
}

/** Hari pertama yang dihitung untuk streak */
function streakStart(st: AppState) {
  const first = st.sessions.reduce((m, s) => (dayKey(s.startedAt) < m ? dayKey(s.startedAt) : m), st.profile ? dayKey(st.profile.createdAt) : dayKey());
  return first;
}

/** Hari istirahat terjadwal (mis. Minggu di program 6 hari) */
export const isScheduledRest = (st: AppState, day: string) => hasSchedule(st) && !workoutForDay(st, isoDay(parseDay(day)));

/**
 * Hari aktif untuk streak: latihan, recovery, Rest Pass, penalti dibersihkan,
 * atau hari istirahat terjadwal. `threatened` = anggap hari yang sedang dipenalti masih aman.
 */
export function activeDays(st: AppState, threatened = false): Set<string> {
  const set = new Set<string>([...st.restDays, ...(st.clearedDays ?? []), ...(st.passDays ?? [])]);
  st.sessions.forEach((s) => set.add(dayKey(s.startedAt)));
  if (threatened && st.penalty?.status === 'active') st.penalty.missedDates.forEach((d) => set.add(d));
  if (hasSchedule(st)) {
    const start = streakStart(st);
    const today = dayKey();
    let d = parseDay(start);
    while (dayKey(d) <= today) {
      const k = dayKey(d);
      if (isScheduledRest(st, k)) set.add(k);
      d = addDays(d, 1);
    }
  }
  return set;
}

export function currentStreak(st: AppState, threatened = false) {
  const days = activeDays(st, threatened);
  let d = new Date();
  // Hari ini belum latihan tidak memutus streak
  if (!days.has(dayKey(d))) d = addDays(d, -1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  // streak yang hanya berisi hari istirahat tidak dihitung
  const hasEffort =
    trainingDays(st).size > 0 || (st.clearedDays ?? []).length > 0 || (threatened && st.penalty?.status === 'active' && st.penalty.missedDates.length > 0);
  return hasEffort ? n : 0;
}

/** Streak sedang terancam penalty quest? */
export const streakThreatened = (st: AppState) => st.penalty?.status === 'active';

export function longestStreak(st: AppState) {
  const days = activeDays(st);
  if (trainingDays(st).size === 0) return 0;
  let best = 0;
  let run = 0;
  let d = parseDay(streakStart(st));
  const today = dayKey();
  while (dayKey(d) <= today) {
    if (days.has(dayKey(d))) {
      run++;
      best = Math.max(best, run);
    } else run = 0;
    d = addDays(d, 1);
  }
  return best;
}

/** 7 hari minggu ini (Senin–Minggu) */
export function weekGrid(st: AppState) {
  const days = activeDays(st);
  const train = trainingDays(st);
  const start = weekStart();
  const today = dayKey();
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
    const k = dayKey(addDays(start, i));
    const trained = train.has(k);
    const pass = (st.passDays ?? []).includes(k);
    const cleared = (st.clearedDays ?? []).includes(k);
    const penalized = st.penalty?.status === 'active' && st.penalty.missedDates.includes(k);
    const plannedRest = isScheduledRest(st, k);
    const missed = !days.has(k) && k < today && !plannedRest;
    return {
      label,
      key: k,
      done: days.has(k),
      trained,
      pass,
      cleared,
      penalized,
      plannedRest,
      missed,
      rest: days.has(k) && !trained && !pass && !cleared,
      today: k === today,
    };
  });
}

// ---------- Atribut ----------
export const ATTRS: Attr[] = ['STR', 'AGI', 'END', 'VIT', 'DIS'];
export const ATTR_LABEL: Record<Attr, string> = {
  STR: 'Strength',
  AGI: 'Agility',
  END: 'Endurance',
  VIT: 'Vitality',
  DIS: 'Discipline',
};

export const WALK_AGI_PER_KM = 1;

/** `before`: hanya hitung jalan kaki sebelum waktu ini (untuk kenaikan 7 hari) */
function attrPoints(st: AppState, sessions: Session[], restDays: string[], before?: string) {
  const p: Record<Attr, number> = { STR: 0, AGI: 0, END: 0, VIT: 0, DIS: 0 };
  for (const s of sessions) {
    for (const x of s.sets) {
      p[x.attr] += 1;
      if (x.rir === 0) p.DIS += 0.5;
    }
    p.DIS += 3;
    p.VIT += 1;
  }
  p.VIT += restDays.length * 0.5;
  // Mode Jalan: +1 AGI per km
  for (const w of st.walks ?? []) if (!before || w.startedAt < before) p.AGI += (w.distanceM / 1000) * WALK_AGI_PER_KM;
  return p;
}

export const ATTR_POINTS_PER_LEVEL = 4;

export function attributes(st: AppState) {
  const now = new Date();
  const weekAgo = addDays(now, -7).toISOString();
  const all = attrPoints(st, st.sessions, st.restDays);
  const old = attrPoints(
    st,
    st.sessions.filter((s) => s.startedAt < weekAgo),
    st.restDays.filter((d) => d < dayKey(addDays(now, -7))),
    weekAgo,
  );
  const val = (pts: number) => 5 + Math.floor(pts / ATTR_POINTS_PER_LEVEL);
  return ATTRS.map((a) => {
    const pts = all[a];
    const into = pts % ATTR_POINTS_PER_LEVEL;
    return {
      attr: a,
      value: val(pts),
      delta: val(pts) - val(old[a]),
      /** total poin mentah */
      points: pts,
      /** progres menuju +1 berikutnya (0–1) */
      progress: into / ATTR_POINTS_PER_LEVEL,
      /** poin yang masih dibutuhkan untuk +1 */
      toNext: ATTR_POINTS_PER_LEVEL - into,
    };
  });
}

// ---------- PR ----------
export const e1rm = (load: number, reps: number) => (reps <= 1 ? load : load * (1 + reps / 30));

export interface PR {
  name: string;
  loadKg: number;
  reps: number;
  e1rm: number;
  date: string;
}

export function personalRecords(sessions: Session[]): PR[] {
  const map = new Map<string, PR>();
  for (const s of sessions) {
    for (const x of s.sets) {
      if (x.loadKg <= 0) continue;
      const key = x.exerciseName.trim().toLowerCase();
      const cur = map.get(key);
      const score = e1rm(x.loadKg, x.reps);
      if (!cur || score > cur.e1rm) map.set(key, { name: x.exerciseName, loadKg: x.loadKg, reps: x.reps, e1rm: score, date: x.at });
    }
  }
  return [...map.values()].sort((a, b) => b.e1rm - a.e1rm);
}

/** Jumlah PR baru yang terjadi sejak `sinceIso` */
export function prsBrokenSince(sessions: Session[], sinceIso: string) {
  const before = personalRecords(sessions.filter((s) => s.startedAt < sinceIso));
  const now = personalRecords(sessions);
  const old = new Map(before.map((p) => [p.name.toLowerCase(), p.e1rm]));
  return now.filter((p) => p.date >= sinceIso && p.e1rm > (old.get(p.name.toLowerCase()) ?? 0)).length;
}

// ---------- Quest ----------
export type QuestType = 'DAILY' | 'WEEKLY' | 'EPIC';
type Metric = (st: AppState, sessions: Session[], period: { from: string }) => number;

export interface QuestDef {
  id: string;
  title: string;
  desc: string;
  rank: Rank;
  type: QuestType;
  target: number;
  unit: string;
  xp: number;
  coins: number;
  titleReward?: string;
  /** quest jalan kaki (Mode Jalan GPS): target dalam km */
  walkKm?: number;
  metric: Metric;
}

const daySessions = (sessions: Session[], from: string) => sessions.filter((s) => s.startedAt >= from);

export const QUESTS: QuestDef[] = [
  { id: 'd-enter', title: 'Daily Dungeon', desc: 'Selesaikan satu sesi latihan hari ini. Sistem menunggu.', rank: 'E', type: 'DAILY', target: 1, unit: 'sesi', xp: 100, coins: 20, metric: (_, ss, p) => daySessions(ss, p.from).length },
  { id: 'd-sets', title: 'Iron Repetition', desc: 'Selesaikan 15 set dalam satu hari. Jangan lengah.', rank: 'D', type: 'DAILY', target: 15, unit: 'set', xp: 150, coins: 30, metric: (_, ss, p) => daySessions(ss, p.from).reduce((a, s) => a + s.sets.length, 0) },
  { id: 'd-volume', title: 'Shadow Load', desc: 'Angkat total 5.000 kg volume hari ini.', rank: 'C', type: 'DAILY', target: 5000, unit: 'kg', xp: 250, coins: 50, metric: (_, ss, p) => daySessions(ss, p.from).reduce((a, s) => a + sessionVolume(s), 0) },
  { id: 'd-failure', title: 'Edge of Failure', desc: 'Selesaikan 3 set dengan RIR 0 hari ini.', rank: 'C', type: 'DAILY', target: 3, unit: 'set', xp: 200, coins: 40, metric: (_, ss, p) => daySessions(ss, p.from).reduce((a, s) => a + s.sets.filter((x) => x.rir === 0).length, 0) },
  { id: 'd-weigh', title: 'Status Check', desc: 'Catat berat badan hari ini di halaman Growth.', rank: 'E', type: 'DAILY', target: 1, unit: 'log', xp: 50, coins: 10, metric: (st, _, p) => st.weights.filter((w) => w.date >= p.from.slice(0, 10)).length },
  { id: 'w-three', title: 'Iron Will Awakening', desc: 'Selesaikan 3 sesi latihan sebelum siklus mingguan berakhir.', rank: 'E', type: 'WEEKLY', target: 3, unit: 'sesi', xp: 800, coins: 100, metric: (_, ss, p) => daySessions(ss, p.from).length },
  { id: 'w-volume', title: 'Mountain Breaker', desc: 'Kumpulkan 20.000 kg volume dalam satu minggu.', rank: 'B', type: 'WEEKLY', target: 20000, unit: 'kg', xp: 1200, coins: 150, metric: (_, ss, p) => daySessions(ss, p.from).reduce((a, s) => a + sessionVolume(s), 0) },
  { id: 'w-tut', title: 'Time Under Shadow', desc: 'Kumpulkan 30 menit time under tension minggu ini.', rank: 'C', type: 'WEEKLY', target: 30, unit: 'menit', xp: 900, coins: 120, metric: (_, ss, p) => Math.floor(daySessions(ss, p.from).reduce((a, s) => a + sessionTut(s), 0) / 60) },
  { id: 'e-streak', title: 'Unbroken Chain', desc: 'Pertahankan streak 30 hari. Peringatan: butuh disiplin tinggi.', rank: 'S', type: 'EPIC', target: 30, unit: 'hari', xp: 5000, coins: 500, titleReward: 'void-walker', metric: (st) => longestStreak(st) },
  { id: 'e-sessions', title: 'Centurion Trial', desc: 'Selesaikan 100 sesi latihan.', rank: 'A', type: 'EPIC', target: 100, unit: 'sesi', xp: 4000, coins: 400, metric: (_, ss) => ss.length },
  { id: 'e-ton', title: 'Abyssal Ton', desc: 'Angkat 10.000 kg dalam satu sesi.', rank: 'A', type: 'EPIC', target: 10000, unit: 'kg', xp: 3000, coins: 300, metric: (_, ss) => Math.max(0, ...ss.map(sessionVolume)) },
];

/** km jalan kaki sejak `from` (ISO) */
export const walkedKm = (st: AppState, from: string) =>
  (st.walks ?? []).filter((w) => w.startedAt >= from).reduce((a, w) => a + w.distanceM, 0) / 1000;

const walkQuest = (km: number, rank: Rank, xp: number, coins: number, title: string, desc: string): QuestDef => ({
  id: `walk-${km}`,
  title,
  desc,
  rank,
  type: 'DAILY',
  target: km,
  unit: 'km',
  xp,
  coins,
  walkKm: km,
  metric: (st, _, p) => Math.floor(walkedKm(st, p.from) * 100) / 100,
});

QUESTS.push(
  walkQuest(1, 'E', 60, 10, 'Shadow Stroll', 'Jalan kaki 1 km hari ini dengan Mode Jalan. Langkah pertama seorang Hunter.'),
  walkQuest(3, 'D', 150, 25, 'Patrol Route', 'Jalan kaki 3 km hari ini. Kenali wilayahmu.'),
  walkQuest(5, 'C', 260, 45, 'Long March', 'Jalan kaki 5 km hari ini. Daya tahan diuji.'),
  walkQuest(8, 'B', 420, 70, 'Iron Trek', 'Jalan kaki 8 km hari ini. Hanya yang gigih sampai di ujung.'),
  walkQuest(10, 'A', 550, 100, 'Abyss Pilgrimage', 'Jalan kaki 10 km hari ini. Peringatan: perjalanan panjang, bawa air minum.'),
);

export function questPeriod(q: QuestDef): { key: string; from: string } {
  const now = new Date();
  if (q.type === 'DAILY') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { key: dayKey(now), from: d.toISOString() };
  }
  if (q.type === 'WEEKLY') return { key: weekKey(now), from: weekStart(now).toISOString() };
  return { key: 'EPIC', from: new Date(0).toISOString() };
}

export function questStatus(st: AppState, q: QuestDef) {
  const period = questPeriod(q);
  const acc = st.quests.find((a) => a.questId === q.id && a.period === period.key);
  const progress = Math.min(q.target, q.metric(st, st.sessions, period));
  return {
    period: period.key,
    accepted: !!acc,
    claimed: !!acc?.claimed,
    progress,
    done: progress >= q.target,
  };
}

// ---------- Gelar (Achievement Hall) ----------
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export interface TitleDef {
  id: string;
  name: string;
  rarity: Rarity;
  desc: string;
  bonus: string;
  target: number;
  progress: (st: AppState) => number;
}

export const TITLES: TitleDef[] = [
  { id: 'awakened', name: 'The Awakened', rarity: 'COMMON', desc: 'Selesaikan sesi latihan pertamamu.', bonus: 'DIS +1', target: 1, progress: (st) => st.sessions.length },
  { id: 'iron-will', name: 'Iron Will', rarity: 'EPIC', desc: 'Angkat total 10.000 kg dalam satu sesi.', bonus: 'STR +5', target: 10000, progress: (st) => Math.max(0, ...st.sessions.map(sessionVolume)) },
  { id: 'tempo-adept', name: 'Tempo Adept', rarity: 'RARE', desc: 'Kumpulkan 60 menit time under tension.', bonus: 'END +3', target: 60, progress: (st) => Math.floor(st.sessions.reduce((a, s) => a + sessionTut(s), 0) / 60) },
  { id: 'week-warden', name: 'Week Warden', rarity: 'RARE', desc: 'Capai streak 7 hari.', bonus: 'VIT +3', target: 7, progress: (st) => longestStreak(st) },
  { id: 'quest-hunter', name: 'Quest Hunter', rarity: 'RARE', desc: 'Klaim hadiah dari 10 quest.', bonus: 'AGI +3', target: 10, progress: (st) => st.quests.filter((q) => q.claimed).length },
  { id: 'void-walker', name: 'Void Walker', rarity: 'LEGENDARY', desc: 'Pertahankan streak 30 hari tanpa putus.', bonus: 'STR +10 AGI +15', target: 30, progress: (st) => longestStreak(st) },
  { id: 'night-sovereign', name: 'Night Sovereign', rarity: 'LEGENDARY', desc: 'Selesaikan 50 sesi sebelum jam 06:00 pagi.', bonus: 'DIS +20', target: 50, progress: (st) => st.sessions.filter((s) => new Date(s.startedAt).getHours() < 6).length },
];

export const titleUnlocked = (st: AppState, t: TitleDef) => t.progress(st) >= t.target;
export const titleById = (id: string | null) => TITLES.find((t) => t.id === id);

// ---------- Kristal ----------
export interface CrystalDef {
  id: string;
  attr: Attr;
  label: string;
  color: string;
  threshold: number;
}
export const CRYSTALS: CrystalDef[] = [
  { id: 'c-str', attr: 'STR', label: 'Strength Crystal', color: '#8B5CF6', threshold: 15 },
  { id: 'c-end', attr: 'END', label: 'Endurance Crystal', color: '#34D399', threshold: 12 },
  { id: 'c-dis', attr: 'DIS', label: 'Discipline Crystal', color: '#F87171', threshold: 15 },
  { id: 'c-agi', attr: 'AGI', label: 'Agility Crystal', color: '#60A5FA', threshold: 12 },
  { id: 'c-vit', attr: 'VIT', label: 'Vitality Crystal', color: '#FBBF24', threshold: 12 },
  { id: 'c-s', attr: 'STR', label: 'Sovereign Crystal', color: '#C4B5FD', threshold: 50 },
];

// ---------- Program & jadwal otomatis ----------
export const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
export const DAY_SHORT = ['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
/** 1 = Senin ... 7 = Minggu */
export const isoDay = (d: Date = new Date()) => ((d.getDay() + 6) % 7) + 1;

/** Minggu program (1-based, tanpa batas) untuk tanggal tertentu */
export function programWeekAbs(st: AppState, at: Date = new Date()) {
  if (!st.program) return null;
  const start = parseDay(st.program.startDate);
  const diff = Math.floor((weekStart(at).getTime() - weekStart(start).getTime()) / (7 * 864e5));
  return Math.max(1, diff + 1);
}

export interface WeekInfo {
  /** minggu dalam blok (1..8) */
  week: number;
  block: number;
  abs: number;
}

export function programWeek(st: AppState, at: Date = new Date()): WeekInfo | null {
  const abs = programWeekAbs(st, at);
  if (abs == null) return null;
  const n = st.program?.weeks ?? PROGRAM_WEEKS;
  return { week: ((abs - 1) % n) + 1, block: Math.floor((abs - 1) / n) + 1, abs };
}

export interface Prescription {
  sets: number;
  rir: number;
  rirLabel: string;
  restSec: number;
  techniqueActive: boolean;
  finisher: 'off' | 'optional' | 'on';
}

/** Resep set/RIR/istirahat untuk minggu tertentu sesuai rencana progresi 8 minggu */
export function prescribe(e: ExerciseTemplate, week: number | null): Prescription {
  const base: Prescription = { sets: e.sets, rir: e.rir, rirLabel: e.rirLabel ?? String(e.rir), restSec: e.restSec, techniqueActive: !!e.technique, finisher: 'on' };
  if (week == null) return base;
  const hold = e.mode === 'hold';
  const lessRest = Math.max(30, e.restSec - 10);
  const kind = e.technique?.kind;
  if (week <= 2) return { ...base, rir: 2, rirLabel: hold ? '—' : '2', techniqueActive: false, finisher: 'optional' };
  if (week <= 4) return { ...base, rir: 1, rirLabel: hold ? '—' : '1', restSec: lessRest, techniqueActive: kind === 'onePointFive' };
  if (week <= 6) return { ...base, restSec: lessRest, techniqueActive: !!kind };
  if (week === 7) return { ...base, rir: 0, rirLabel: hold ? '—' : '0 (set terakhir)', restSec: lessRest, techniqueActive: !!kind };
  return { ...base, sets: Math.max(1, Math.round(e.sets * 0.6)), rir: 3, rirLabel: hold ? '—' : '3–4', techniqueActive: false, finisher: 'off' };
}

/** Exercise dengan sets/RIR/istirahat sudah disesuaikan minggu ini */
export function applyWeek(e: ExerciseTemplate, week: number | null): ExerciseTemplate & { rx: Prescription } {
  const rx = prescribe(e, week);
  return { ...e, sets: rx.sets, rir: rx.rir, rirLabel: rx.rirLabel, restSec: rx.restSec, rx };
}

export function workoutForWeek(w: Workout, week: number | null) {
  return { ...w, exercises: w.exercises.map((e) => applyWeek(e, week)) };
}

export const hasSchedule = (st: AppState) => st.workouts.some((w) => w.day);
export const workoutForDay = (st: AppState, day: number) => st.workouts.find((w) => w.day === day) ?? null;

export type TodayPlan =
  | { kind: 'workout'; workout: Workout; done: boolean }
  | { kind: 'rest'; tomorrow: Workout | null };

/** Rencana hari ini: jadwal per hari jika ada, kalau tidak rotasi */
export function todayPlan(st: AppState, at: Date = new Date()): TodayPlan {
  const today = dayKey(at);
  const doneToday = st.sessions.some((s) => dayKey(s.startedAt) === today);
  if (hasSchedule(st)) {
    const w = workoutForDay(st, isoDay(at));
    if (!w) {
      const next = [1, 2, 3, 4, 5, 6, 7].map((k) => workoutForDay(st, ((isoDay(at) - 1 + k) % 7) + 1)).find(Boolean) ?? null;
      return { kind: 'rest', tomorrow: next };
    }
    return { kind: 'workout', workout: w, done: st.sessions.some((s) => dayKey(s.startedAt) === today && s.workoutId === w.id) };
  }
  if (st.workouts.length === 0) return { kind: 'rest', tomorrow: null };
  const sorted = [...st.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const last = sorted[0];
  if (doneToday && last) {
    const w = st.workouts.find((x) => x.id === last.workoutId);
    if (w) return { kind: 'workout', workout: w, done: true };
  }
  const idx = last ? st.workouts.findIndex((w) => w.id === last.workoutId) : -1;
  return { kind: 'workout', workout: st.workouts[(idx + 1) % st.workouts.length] ?? st.workouts[0], done: false };
}

/** Kompatibilitas: dungeon yang disarankan (null di hari istirahat) */
export function nextWorkout(st: AppState) {
  const p = todayPlan(st);
  return p.kind === 'workout' ? p.workout : null;
}

export { weekPhase };

/**
 * Siap naik level: dua sesi terakhir berturut-turut mencapai batas atas reps di semua set
 * dengan sisa ≥1 rep (RIR ≥ 1).
 */
export function readyToProgress(sessions: Session[], e: ExerciseTemplate) {
  const key = e.name.trim().toLowerCase();
  const recent = [...sessions]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .map((s) => s.sets.filter((x) => x.exerciseName.trim().toLowerCase() === key))
    .filter((sets) => sets.length > 0)
    .slice(0, 2);
  if (recent.length < 2) return false;
  return recent.every((sets) => sets.length >= Math.min(e.sets, 3) && sets.every((x) => x.reps >= e.repMax && x.rir >= 1));
}
