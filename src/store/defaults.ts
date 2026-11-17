import type { AppState, ExerciseTemplate, Workout } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const ex = (e: Omit<ExerciseTemplate, 'id'>): ExerciseTemplate => ({ id: uid(), ...e });

export function defaultWorkouts(): Workout[] {
  return [
    {
      id: uid(),
      name: 'Push A',
      subtitle: 'Chest / Shoulders / Triceps',
      exercises: [
        ex({ name: 'DB Floor Press', sets: 4, repMin: 8, repMax: 10, tempo: '3010', restSec: 90, rir: 1, muscles: ['Chest', 'Triceps'], attr: 'STR', load: 20 }),
        ex({ name: 'Overhead Press', sets: 3, repMin: 8, repMax: 10, tempo: '2010', restSec: 90, rir: 2, muscles: ['Shoulders', 'Core Stability'], attr: 'STR', load: 30 }),
        ex({ name: 'Lateral Raises', sets: 3, repMin: 12, repMax: 15, tempo: '2011', restSec: 60, rir: 1, muscles: ['Shoulders'], attr: 'END', load: 7.5 }),
        ex({ name: 'Push Ups', sets: 2, repMin: 12, repMax: 20, tempo: '2010', restSec: 60, rir: 0, muscles: ['Chest', 'Triceps'], attr: 'END', load: 0 }),
      ],
    },
    {
      id: uid(),
      name: 'Pull A',
      subtitle: 'Back / Biceps / Rear Delts',
      exercises: [
        ex({ name: 'Deadlift', sets: 3, repMin: 5, repMax: 6, tempo: '2010', restSec: 150, rir: 2, muscles: ['Back', 'Glutes', 'Hamstrings'], attr: 'STR', load: 80 }),
        ex({ name: 'DB Row', sets: 4, repMin: 8, repMax: 12, tempo: '2011', restSec: 90, rir: 1, muscles: ['Back', 'Biceps'], attr: 'STR', load: 22.5 }),
        ex({ name: 'Face Pull', sets: 3, repMin: 12, repMax: 15, tempo: '2011', restSec: 60, rir: 1, muscles: ['Rear Delts'], attr: 'END', load: 15 }),
        ex({ name: 'Hammer Curl', sets: 3, repMin: 10, repMax: 12, tempo: '3010', restSec: 60, rir: 1, muscles: ['Biceps'], attr: 'STR', load: 10 }),
      ],
    },
    {
      id: uid(),
      name: 'Legs A',
      subtitle: 'Quads / Glutes / Core',
      exercises: [
        ex({ name: 'Squat', sets: 5, repMin: 10, repMax: 12, tempo: '3010', restSec: 120, rir: 2, muscles: ['Quads', 'Glutes', 'Core Stability'], attr: 'STR', load: 60 }),
        ex({ name: 'Bulgarian Split Squat', sets: 3, repMin: 8, repMax: 10, tempo: '2010', restSec: 90, rir: 1, muscles: ['Quads', 'Glutes'], attr: 'AGI', load: 12.5 }),
        ex({ name: 'Romanian Deadlift', sets: 3, repMin: 8, repMax: 10, tempo: '3010', restSec: 90, rir: 2, muscles: ['Hamstrings', 'Glutes'], attr: 'STR', load: 50 }),
        ex({ name: 'Plank', sets: 3, repMin: 30, repMax: 45, tempo: '', restSec: 60, rir: 0, muscles: ['Core Stability'], attr: 'VIT', load: 0 }),
      ],
    },
  ];
}

export function initialState(): AppState {
  return {
    version: 1,
    profile: null,
    workouts: defaultWorkouts(),
    sessions: [],
    active: null,
    weights: [],
    photos: [],
    quests: [],
    restDays: [],
    bonusXp: 0,
    coins: 0,
    equippedTitle: null,
    settings: { unit: 'kg', haptics: true, tempoCue: true },
  };
}
