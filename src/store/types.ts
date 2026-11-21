export type Attr = 'STR' | 'END' | 'AGI' | 'VIT' | 'DIS';
export type Unit = 'kg' | 'lbs';
export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Profile {
  name: string;
  heightCm: number;
  weightKg: number;
  age: number;
  createdAt: string;
  avatarUri?: string;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  sets: number;
  repMin: number;
  repMax: number;
  /** 4 digit tempo, mis. "3010" = eksentrik 3s, jeda 0s, konsentrik 1s, jeda 0s. Kosong = tanpa tempo */
  tempo: string;
  restSec: number;
  rir: number;
  muscles: string[];
  attr: Attr;
  /** beban default (kg) */
  load: number;
  /** label RIR dari program, mis. "0–1" */
  rirLabel?: string;
  /** repetisi/set dihitung per sisi (unilateral) */
  perSide?: boolean;
  /** reps = repetisi biasa, amrap = sebanyak mungkin, hold = tahan (repMin–repMax dalam detik) */
  mode?: 'reps' | 'amrap' | 'hold';
  technique?: Technique;
  guide?: ExerciseGuide;
}

export type TechniqueKind = 'onePointFive' | 'myo' | 'drop';
export interface Technique {
  kind: TechniqueKind;
  note: string;
}

export interface ExerciseGuide {
  how: string;
  mistakes: string;
  easier: string;
  harder: string;
}

export interface Workout {
  id: string;
  name: string;
  subtitle: string;
  exercises: ExerciseTemplate[];
  /** hari jadwal: 1 = Senin ... 7 = Minggu */
  day?: number;
  focus?: 'upper' | 'lower';
  finisher?: string;
  cooldown?: string;
}

export interface ProgramInfo {
  name: string;
  /** Senin minggu pertama (YYYY-MM-DD) */
  startDate: string;
  weeks: number;
}

export interface SetLog {
  exerciseId: string;
  exerciseName: string;
  attr: Attr;
  setIndex: number;
  reps: number;
  loadKg: number;
  rir: number;
  tutSec: number;
  at: string;
}

export interface Session {
  id: string;
  workoutId: string;
  workoutName: string;
  startedAt: string;
  endedAt?: string;
  sets: SetLog[];
  xp: number;
  /** XP dipotong debuff Weakened */
  debuffed?: boolean;
}

/** Timer istirahat antar set — disimpan global agar tetap jalan saat pindah halaman */
export interface RestTimer {
  startedAt: number;
  endsAt: number;
  /** latihan & set berikutnya yang menunggu */
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  sets: number;
  workoutName: string;
}

/** Sesi Mode Jalan (GPS) yang sudah selesai */
export interface WalkLog {
  id: string;
  startedAt: string;
  endedAt: string;
  distanceM: number;
  durationSec: number;
  /** titik rute ringkas (lihat src/walk/route.ts) — tidak ada untuk sesi sebelum fitur rute */
  route?: [number, number, number, number, number][];
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  kg: number;
}

export interface Photo {
  id: string;
  uri: string;
  date: string;
}

export interface QuestAccept {
  questId: string;
  period: string;
  claimed: boolean;
}

export interface NotifSettings {
  enabled: boolean;
  briefing: boolean; // 07.30
  workout: boolean; // 18.45 & 20.30
  streak: boolean; // 21.30 streak/penalti/reward
  weekly: boolean; // Sabtu 19.00
  weighIn: boolean; // Minggu 08.00
  restTimer: boolean;
  penalty: boolean;
}

export interface LockSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface Settings {
  unit: Unit;
  haptics: boolean;
  tempoCue: boolean;
  notif: NotifSettings;
  lock: LockSettings;
}

export type PenaltyFocus = 'push' | 'pull' | 'leg' | 'mixed';

export interface Penalty {
  id: string;
  /** hari latihan yang terlewat */
  missedDates: string[];
  workoutName: string;
  focus: PenaltyFocus;
  rounds: number;
  roundsDone: number;
  /** hari penalti harus diselesaikan (batas 23:59) */
  activeDate: string;
  status: 'active' | 'cleared';
}

export interface SystemNotice {
  kind: 'penalty-new' | 'penalty-failed' | 'penalty-cleared';
  text: string;
  date: string;
}

export interface AppState {
  version: 1;
  profile: Profile | null;
  workouts: Workout[];
  sessions: Session[];
  active: Session | null;
  restTimer: RestTimer | null;
  walks: WalkLog[];
  /** level tertinggi yang sudah dirayakan (pop-up level up) */
  seenLevel: number;
  weights: WeightEntry[];
  photos: Photo[];
  quests: QuestAccept[];
  restDays: string[];
  bonusXp: number;
  coins: number;
  equippedTitle: string | null;
  settings: Settings;
  program: ProgramInfo | null;
  penalty: Penalty | null;
  /** hari terlewat yang "dibersihkan" lewat penalty quest (streak tetap jalan) */
  clearedDays: string[];
  /** hari izin memakai Rest Pass */
  passDays: string[];
  restPasses: number;
  /** sisa sesi dengan debuff Weakened (XP −25%) */
  debuffSessions: number;
  /** hari terakhir yang sudah dievaluasi untuk penalti */
  lastCheckDay: string | null;
  notice: SystemNotice | null;
  /** tanggal saat lockdown dibuka lewat buka darurat */
  emergencyUnlocks: string[];
}
