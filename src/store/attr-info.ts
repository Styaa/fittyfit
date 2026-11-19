// Penjelasan setiap atribut & cara menaikkannya (sesuai aturan di attrPoints() pada logic.ts)
import type { IconName } from '@/components/ui';

import { CRYSTALS } from './logic';
import type { AppState, Attr } from './types';

export const ATTR_ICON: Record<Attr, IconName> = {
  STR: 'dumbbell',
  AGI: 'run-fast',
  END: 'shield-outline',
  VIT: 'heart-outline',
  DIS: 'lightning-bolt-outline',
};

export interface AttrInfo {
  name: string;
  /** deskripsi gaya System / RPG */
  lore: string;
  /** makna di dunia nyata */
  real: string;
  /** cara mendapat poin (aturan yang benar-benar dipakai) */
  sources: { text: string; points: string }[];
  tips: string[];
}

export const ATTR_INFO: Record<Attr, AttrInfo> = {
  STR: {
    name: 'Strength',
    lore: 'Kekuatan mentah seorang Hunter. Menentukan seberapa berat beban yang bisa kamu taklukkan.',
    real: 'Kekuatan & massa otot dari gerakan compound: press, row, squat, deadlift, curl.',
    sources: [{ text: 'Setiap set selesai dari gerakan bertanda STR', points: '+1 poin' }],
    tips: [
      'Gerakan STR paling banyak di program ini, jadi STR akan naik paling cepat.',
      'Selesaikan semua set gerakan utama (latihan pertama tiap dungeon) sebelum yang lain.',
      'Naikkan beban saat tanda "▲ Siap naik level" muncul.',
    ],
  },
  AGI: {
    name: 'Agility',
    lore: 'Kelincahan dan keseimbangan. Hunter yang gesit tidak pernah kehilangan pijakan.',
    real: 'Keseimbangan & kekuatan satu sisi dari gerakan unilateral kaki: split squat, lunge, step-up, single-leg RDL.',
    sources: [{ text: 'Setiap set selesai dari gerakan bertanda AGI', points: '+1 poin' }],
    tips: [
      'Gerakan AGI ada di Leg A & Leg B. Jangan lewatkan hari kaki.',
      'Kerjakan kedua sisi (kiri & kanan) dengan jumlah reps yang sama.',
    ],
  },
  END: {
    name: 'Endurance',
    lore: 'Daya tahan untuk terus bertarung saat yang lain sudah tumbang.',
    real: 'Daya tahan otot dari gerakan isolasi & repetisi tinggi: lateral raise, fly, kickback, calf raise, push-up variasi.',
    sources: [{ text: 'Setiap set selesai dari gerakan bertanda END', points: '+1 poin' }],
    tips: [
      'Selesaikan juga gerakan di akhir dungeon, bukan hanya gerakan utama.',
      'Push A & Push B paling banyak berisi gerakan END.',
    ],
  },
  VIT: {
    name: 'Vitality',
    lore: 'Daya hidup dan pemulihan. Fondasi yang membuat tubuh tetap berdiri.',
    real: 'Kekuatan core & punggung bawah, ditambah konsistensi latihan dan istirahat yang cukup.',
    sources: [
      { text: 'Setiap set selesai dari gerakan core (plank, hollow hold, superman)', points: '+1 poin' },
      { text: 'Setiap dungeon yang diselesaikan', points: '+1 poin' },
      { text: 'Setiap hari recovery yang dicatat', points: '+0,5 poin' },
    ],
    tips: ['Jangan lewatkan plank & superman di akhir sesi.', 'Di hari istirahat, tekan "Catat Recovery" di Today\'s Dungeon.'],
  },
  DIS: {
    name: 'Discipline',
    lore: 'Tekad yang tidak bisa dipatahkan. System menghargai mereka yang datang setiap hari.',
    real: 'Konsistensi dan kesediaan berlatih sampai batas. Tidak terikat jenis gerakan tertentu.',
    sources: [
      { text: 'Setiap dungeon yang diselesaikan', points: '+3 poin' },
      { text: 'Setiap set yang dikerjakan sampai gagal (RIR 0)', points: '+0,5 poin' },
    ],
    tips: [
      'Cara tercepat: datang setiap hari latihan. Satu dungeon = 3 poin.',
      'Mulai minggu ke-5–7, set terakhir dikerjakan sampai gagal. Catat RIR 0 dengan jujur.',
    ],
  },
};

/** Gerakan di program pengguna yang memberi poin ke atribut ini, dikelompokkan per dungeon */
export function exercisesForAttr(st: AppState, attr: Attr) {
  return [...st.workouts]
    .sort((a, b) => (a.day ?? 99) - (b.day ?? 99))
    .map((w) => ({ workout: w.name, exercises: w.exercises.filter((e) => e.attr === attr).map((e) => e.name) }))
    .filter((g) => g.exercises.length > 0);
}

export const crystalsForAttr = (attr: Attr) => CRYSTALS.filter((c) => c.attr === attr);
