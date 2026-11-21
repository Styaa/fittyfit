// Mode Jalan: pelacakan jarak jalan kaki dengan GPS.
// Hanya aktif saat pengguna menekan "Mulai Jalan" dari quest jalan.
// Di Android memakai foreground service (notifikasi "Mode Jalan aktif") agar tetap jalan saat layar mati;
// izin yang dibutuhkan hanya lokasi "saat aplikasi digunakan".
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { DistanceFilter } from './geo';
import { downsample, packRoute, type PackedPoint, type RoutePoint } from './route';

export const WALK_TASK = 'shadowfit-walk';
const KEY = 'shadowfit:walk:v1';

export interface WalkState {
  active: boolean;
  paused: boolean;
  startedAt: number;
  pausedAt: number | null;
  pausedMs: number;
  distanceM: number;
  /** akurasi titik GPS terakhir (meter) */
  lastAcc: number | null;
  lastFixAt: number | null;
  /** titik rute yang sudah lolos penyaring */
  route: RoutePoint[];
  /** nomor segmen (bertambah setiap lanjut setelah jeda) */
  seg: number;
}

export interface WalkResult {
  startedAt: number;
  endedAt: number;
  distanceM: number;
  durationSec: number;
  route: PackedPoint[];
}

/** status awal — selalu objek & array baru (jangan dibagi antar sesi) */
const idle = (): WalkState => ({ active: false, paused: false, startedAt: 0, pausedAt: null, pausedMs: 0, distanceM: 0, lastAcc: null, lastFixAt: null, route: [], seg: 0 });
const LIVE_MAX_POINTS = 3000;

let state: WalkState = idle();
const filter = new DistanceFilter();
const listeners = new Set<(s: WalkState) => void>();
let watchSub: Location.LocationSubscription | null = null;
let usingTask = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let loaded = false;

const native = Platform.OS === 'android' || Platform.OS === 'ios';

function emit() {
  const snap = { ...state };
  listeners.forEach((l) => l(snap));
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, 800);
}

function handleLocations(locs: Location.LocationObject[]) {
  if (!state.active || state.paused) return;
  for (const l of locs) {
    const add = filter.push({ lat: l.coords.latitude, lon: l.coords.longitude, acc: l.coords.accuracy ?? null, t: l.timestamp });
    state.distanceM += add;
    state.lastAcc = l.coords.accuracy ?? null;
    state.lastFixAt = l.timestamp;
    // catat titik rute: saat jarak bertambah, atau titik pertama sebuah segmen
    const last = state.route[state.route.length - 1];
    const a = filter.anchorPoint();
    if (a && (add > 0 || !last || last.seg !== state.seg)) {
      // array baru (immutable) — React Compiler mengandalkan perubahan referensi untuk merender ulang
      const next = [...state.route, { lat: a.lat, lon: a.lon, t: l.timestamp, d: state.distanceM, seg: state.seg }];
      state.route = next.length > LIVE_MAX_POINTS ? downsample(next, LIVE_MAX_POINTS / 2) : next;
    }
  }
  emit();
}

// Task latar harus didefinisikan di level modul (dimuat saat aplikasi start)
if (native) {
  try {
    TaskManager.defineTask(WALK_TASK, async ({ data, error }) => {
      if (error) return;
      const locations = (data as { locations?: Location.LocationObject[] })?.locations ?? [];
      if (!loaded) await loadWalk();
      handleLocations(locations);
    });
  } catch {
    // abaikan: task tidak tersedia (mis. Expo Go tertentu)
  }
}

async function startUpdates() {
  usingTask = false;
  if (native) {
    try {
      await Location.startLocationUpdatesAsync(WALK_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 3,
        activityType: Location.ActivityType.Fitness,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Shadow Fit · Mode Jalan aktif',
          notificationBody: 'Jarak jalan kakimu sedang dihitung.',
          notificationColor: '#8B5CF6',
          killServiceOnDestroy: false,
        },
      });
      usingTask = true;
      return;
    } catch {
      // gagal (mis. tidak didukung) → pakai pelacakan biasa saat aplikasi terbuka
    }
  }
  watchSub = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 3 },
    (loc) => handleLocations([loc]),
  );
}

async function stopUpdates() {
  watchSub?.remove();
  watchSub = null;
  if (native) {
    try {
      if (await Location.hasStartedLocationUpdatesAsync(WALK_TASK)) await Location.stopLocationUpdatesAsync(WALK_TASK);
    } catch {
      // abaikan
    }
  }
  usingTask = false;
}

/** Pulihkan sesi jalan setelah aplikasi dibuka ulang */
export async function loadWalk() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = { ...idle(), ...JSON.parse(raw) };
  } catch {
    state = idle();
  }
  filter.reset();
  emit();
  if (state.active && !state.paused) {
    const running = native ? await Location.hasStartedLocationUpdatesAsync(WALK_TASK).catch(() => false) : false;
    if (!running && !watchSub) await startUpdates().catch(() => {});
  }
}

export type StartError = 'denied' | 'gps-off' | 'error';

export async function startWalk(): Promise<StartError | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return 'denied';
    if (native && !(await Location.hasServicesEnabledAsync())) return 'gps-off';
    state = { ...idle(), active: true, startedAt: Date.now() };
    filter.reset();
    emit();
    await startUpdates();
    return null;
  } catch {
    state = idle();
    emit();
    return 'error';
  }
}

/** tutup segmen: tambahkan sisa jarak & titik akhir rute */
function closeSegment() {
  const extra = filter.flush();
  const end = filter.endPoint();
  state.distanceM += extra;
  if (end && extra > 0) state.route = [...state.route, { lat: end.lat, lon: end.lon, t: state.lastFixAt ?? Date.now(), d: state.distanceM, seg: state.seg }];
}

export async function pauseWalk() {
  if (!state.active || state.paused) return;
  await stopUpdates();
  closeSegment();
  state = { ...state, paused: true, pausedAt: Date.now() };
  emit();
}

export async function resumeWalk() {
  if (!state.active || !state.paused) return;
  state = { ...state, paused: false, pausedMs: state.pausedMs + (Date.now() - (state.pausedAt ?? Date.now())), pausedAt: null, seg: state.seg + 1 };
  filter.reset(); // jangan hitung jarak selama jeda
  emit();
  await startUpdates();
}

export async function finishWalk(): Promise<WalkResult | null> {
  if (!state.active) return null;
  await stopUpdates();
  if (!state.paused) closeSegment();
  const endedAt = Date.now();
  const result: WalkResult = {
    startedAt: state.startedAt,
    endedAt,
    distanceM: Math.round(state.distanceM),
    durationSec: Math.round(walkElapsed(state, endedAt)),
    route: packRoute(state.route, state.startedAt),
  };
  state = idle();
  emit();
  return result;
}

export async function discardWalk() {
  await stopUpdates();
  state = idle();
  emit();
}

export function walkElapsed(s: WalkState, now = Date.now()) {
  if (!s.active) return 0;
  const end = s.paused && s.pausedAt ? s.pausedAt : now;
  return Math.max(0, (end - s.startedAt - s.pausedMs) / 1000);
}

export const isTaskMode = () => usingTask;
export const getWalk = () => ({ ...state });

/** Hook: status Mode Jalan (re-render tiap perubahan + tiap detik saat aktif) */
export function useWalk() {
  const [s, setS] = useState<WalkState>(() => ({ ...state }));
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = (n: WalkState) => setS(n);
    listeners.add(l);
    setS({ ...state });
    loadWalk();
    return () => {
      listeners.delete(l);
    };
  }, []);
  useEffect(() => {
    if (!s.active || s.paused) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [s.active, s.paused]);
  return s;
}
