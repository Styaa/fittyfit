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
}

export interface Workout {
  id: string;
  name: string;
  subtitle: string;
  exercises: ExerciseTemplate[];
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

export interface Settings {
  unit: Unit;
  haptics: boolean;
  tempoCue: boolean;
}

export interface AppState {
  version: 1;
  profile: Profile | null;
  workouts: Workout[];
  sessions: Session[];
  active: Session | null;
  weights: WeightEntry[];
  photos: Photo[];
  quests: QuestAccept[];
  restDays: string[];
  bonusXp: number;
  coins: number;
  equippedTitle: string | null;
  settings: Settings;
}
