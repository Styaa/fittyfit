import { dayKey, weekStart } from './dates';
import { PROGRAM_NAME, PROGRAM_WEEKS, programWorkouts } from './program8';
import type { AppState, ProgramInfo } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const newProgramInfo = (start: Date = new Date()): ProgramInfo => ({
  name: PROGRAM_NAME,
  startDate: dayKey(weekStart(start)),
  weeks: PROGRAM_WEEKS,
});

export function initialState(): AppState {
  return {
    version: 1,
    profile: null,
    workouts: programWorkouts(),
    program: newProgramInfo(),
    sessions: [],
    active: null,
    weights: [],
    photos: [],
    quests: [],
    restDays: [],
    bonusXp: 0,
    coins: 0,
    equippedTitle: null,
    settings: { unit: 'kg', haptics: true, tempoCue: false },
  };
}
