// Notifikasi lokal bergaya "System". Tanpa server: semua dijadwalkan di HP,
// lalu dijadwalkan ulang setiap kali data berubah (mis. setelah latihan → pengingat hari itu batal).
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AppState } from '@/store/types';

import { planNotifications, PREFIX } from './plan';

const REST_ID = 'sf-rest';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

let configured = false;

export function configureNotifications() {
  if (!supported || configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async (n) => {
      // saat aplikasi terbuka, rest timer sudah tampil di layar → jangan tampilkan banner
      const isRest = n.request.identifier === REST_ID;
      return { shouldShowBanner: !isRest, shouldShowList: !isRest, shouldPlaySound: !isRest, shouldSetBadge: false };
    },
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('reminders', {
      name: 'Pengingat System',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#8B5CF6',
      vibrationPattern: [0, 250, 150, 250],
    }).catch(() => {});
    Notifications.setNotificationChannelAsync('timer', {
      name: 'Rest timer',
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#34D399',
      vibrationPattern: [0, 400, 200, 400],
    }).catch(() => {});
  }
}

export async function ensurePermission(ask = true) {
  if (!supported) return false;
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!ask || !cur.canAskAgain) return false;
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

let syncing: Promise<void> | null = null;

/** Batalkan & jadwalkan ulang semua pengingat (kecuali rest timer) */
export async function syncNotifications(st: AppState) {
  if (!supported) return;
  if (syncing) await syncing;
  syncing = (async () => {
    try {
      const plan = planNotifications(st);
      if (plan.length && !(await ensurePermission(true))) return;
      const existing = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        existing
          .filter((x) => x.identifier.startsWith(PREFIX) && x.identifier !== REST_ID)
          .map((x) => Notifications.cancelScheduledNotificationAsync(x.identifier).catch(() => {})),
      );
      for (const p of plan) {
        await Notifications.scheduleNotificationAsync({
          identifier: p.id,
          content: { title: p.title, body: p.body, sound: true, color: '#8B5CF6' },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.at, channelId: 'reminders' },
        }).catch(() => {});
      }
    } catch {
      // abaikan: notifikasi tidak boleh merusak aplikasi
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

/** Notifikasi saat rest timer habis (berguna saat HP terkunci) */
export async function scheduleRestDone(endMs: number, exercise: string, setIndex: number, enabled: boolean) {
  if (!supported) return;
  await cancelRestDone();
  if (!enabled) return;
  const seconds = Math.round((endMs - Date.now()) / 1000);
  if (seconds < 3) return;
  if (!(await ensurePermission(true))) return;
  await Notifications.scheduleNotificationAsync({
    identifier: REST_ID,
    content: { title: '[SYSTEM] Rest Selesai', body: `Set ${setIndex} ${exercise} siap. Kembali ke dungeon.`, sound: true, color: '#34D399' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: 'timer' },
  }).catch(() => {});
}

export async function cancelRestDone() {
  if (!supported) return;
  await Notifications.cancelScheduledNotificationAsync(REST_ID).catch(() => {});
}

export async function sendTestNotification() {
  if (!supported) return false;
  if (!(await ensurePermission(true))) return false;
  await Notifications.scheduleNotificationAsync({
    identifier: `${PREFIX}test`,
    content: { title: '[SYSTEM] Tes Notifikasi', body: 'Notifikasi aktif. System akan mengawasimu, Hunter.', sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: 'reminders' },
  });
  return true;
}

export async function countScheduled() {
  if (!supported) return 0;
  const all = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  return all.filter((x) => x.identifier.startsWith(PREFIX) && x.identifier !== REST_ID).length;
}

export const notificationsSupported = supported;
