// Penyusun jadwal notifikasi (murni, tanpa dependensi Expo → mudah diuji)
import { addDays, dayKey } from '@/store/dates';
import { currentStreak, isoDay, programWeek, QUESTS, questStatus, weekPhase, workoutForDay } from '@/store/logic';
import type { AppState } from '@/store/types';

export const PREFIX = 'sf-';
const DAYS_AHEAD = 7;

export interface Planned {
  id: string;
  at: Date;
  title: string;
  body: string;
}

const at = (day: Date, h: number, m: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);

/** Susun daftar notifikasi 7 hari ke depan berdasarkan state saat ini */
export function planNotifications(st: AppState, now: Date = new Date()): Planned[] {
  const n = st.settings.notif;
  if (!st.profile || !n.enabled) return [];
  const out: Planned[] = [];
  const today = dayKey(now);
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = addDays(base, i);
    const k = dayKey(d);
    const isToday = k === today;
    const dow = isoDay(d);
    const w = workoutForDay(st, dow);
    const wk = programWeek(st, d);
    const trained = st.sessions.some((s) => dayKey(s.startedAt) === k);
    const passed = st.passDays.includes(k);
    const pending = !!w && !trained && !passed;
    const add = (key: string, h: number, m: number, title: string, body: string) => out.push({ id: `${PREFIX}${k}-${key}`, at: at(d, h, m), title, body });

    // 07.30 briefing
    if (n.briefing) {
      let body = w ? `Dungeon hari ini: ${w.name} · ${w.subtitle}.` : 'Hari istirahat. Pulihkan diri: jalan santai, stretching, tidur cukup.';
      if (dow === 1 && wk) {
        const ph = weekPhase(wk.week);
        body = `Minggu ke-${wk.week}: ${ph.name} (${ph.rirText}). ` + body;
      }
      if (isToday && st.penalty?.status === 'active') body += ' ⚠ Penalty Quest aktif, batas 23:59.';
      if (passed) body = 'Rest Pass aktif hari ini. Tidak ada penalti. Pulihkan diri, Hunter.';
      add('brief', 7, 30, '[SYSTEM] Briefing Harian', body);
    }
    // Minggu 08.00 timbang & foto
    if (n.weighIn && dow === 7) add('weigh', 8, 0, '[SYSTEM] Status Check Mingguan', 'Catat berat badan dan ambil foto progres di halaman Growth.');

    // Penalty quest (hanya hari ini)
    if (n.penalty && isToday && st.penalty?.status === 'active') {
      const p = st.penalty;
      const msg = `Penalty Quest belum selesai (${p.roundsDone}/${p.rounds} ronde). Batas 23:59, streak dipertaruhkan.`;
      add('pen-noon', 12, 0, '[SYSTEM] Penalty Quest', msg);
      add('pen-eve', 20, 0, '[SYSTEM] Penalty Quest', msg);
    }

    // Sabtu 19.00 quest mingguan
    if (n.weekly && dow === 6) {
      if (isToday) {
        const open = QUESTS.filter((q) => q.type === 'WEEKLY')
          .map((q) => ({ q, s: questStatus(st, q) }))
          .filter((x) => x.s.accepted && !x.s.done);
        if (open.length)
          add('weekly', 19, 0, '[SYSTEM] Siklus Mingguan Hampir Berakhir', open.map((x) => `${x.q.title}: ${Math.floor(x.s.progress)}/${x.q.target} ${x.q.unit}`).join(' · '));
      } else {
        add('weekly', 19, 0, '[SYSTEM] Siklus Mingguan Hampir Berakhir', 'Quest mingguan direset besok malam. Cek progresmu di Quest Board.');
      }
    }

    // 18.45 & 20.30 pengingat dungeon
    if (n.workout && pending) {
      add('pre', 18, 45, '[SYSTEM] Dungeon Dibuka dalam 15 Menit', `${w!.name} · ${w!.subtitle}. Bersiaplah, Hunter.`);
      add('remind', 20, 30, '[SYSTEM] Peringatan', `Dungeon hari ini (${w!.name}) belum dimasuki.`);
    }

    // 21.30 streak terancam / reward menunggu
    if (n.streak) {
      if (pending) {
        const streak = isToday ? currentStreak(st) : 0;
        add(
          'streak',
          21,
          30,
          '[SYSTEM] Streak Terancam',
          streak > 0
            ? `Streak ${streak} hari akan putus. Gagal masuk dungeon hari ini = Penalty Quest besok.`
            : 'Gagal masuk dungeon hari ini = Penalty Quest besok.',
        );
      } else if (isToday) {
        const unclaimed = QUESTS.filter((q) => {
          const s = questStatus(st, q);
          return s.accepted && s.done && !s.claimed;
        }).length;
        if (unclaimed) add('reward', 21, 30, '[SYSTEM] Reward Menunggu', `${unclaimed} quest selesai belum diklaim. Klaim sebelum tengah malam.`);
      }
    }
  }
  const minTime = now.getTime() + 30_000;
  return out.filter((p) => p.at.getTime() > minTime);
}

