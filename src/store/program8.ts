// Program Hipertrofi 8 Minggu di Rumah — dumbbell ringan, tanpa bench/barbel/pull-up bar
import type { Attr, ExerciseGuide, ExerciseTemplate, Technique, Workout } from './types';

const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const PROGRAM_NAME = 'Program Hipertrofi 8 Minggu';
export const PROGRAM_WEEKS = 8;
export const DUMBBELL_KG = 5;

const T15 = (note = 'Set terakhir: tambahkan 1.5 reps (repetisi penuh + setengah repetisi = 1 rep).'): Technique => ({ kind: 'onePointFive', note });
const MYO = (note = 'Set terakhir: setelah gagal, istirahat 15–20 detik lalu 3–5 reps lagi. Ulangi 2–3 mini-set.'): Technique => ({ kind: 'myo', note });
const DROP = (note: string): Technique => ({ kind: 'drop', note });

type ExIn = {
  name: string;
  muscles: string[];
  sets: number;
  reps: [number, number];
  tempo: string;
  rest: number;
  rir: number;
  rirLabel?: string;
  attr: Attr;
  load?: number;
  perSide?: boolean;
  mode?: 'reps' | 'amrap' | 'hold';
  technique?: Technique;
  guide: ExerciseGuide;
};

const ex = (e: ExIn): ExerciseTemplate => ({
  id: rid(),
  name: e.name,
  muscles: e.muscles,
  sets: e.sets,
  repMin: e.reps[0],
  repMax: e.reps[1],
  tempo: e.tempo,
  restSec: e.rest,
  rir: e.rir,
  rirLabel: e.rirLabel ?? String(e.rir),
  attr: e.attr,
  load: e.load ?? DUMBBELL_KG,
  perSide: e.perSide,
  mode: e.mode ?? 'reps',
  technique: e.technique,
  guide: e.guide,
});

export const WARMUP = {
  upper: [
    'Mobilitas (2 mnt): putaran lengan 10x maju & 10x mundur, putaran pinggul 10x tiap arah, bodyweight good morning x10, world’s greatest stretch x5/sisi',
    'Aktivasi (2–3 mnt): scapular retraction x15, cat-cow x10',
    'Pemanasan spesifik (2–3 mnt): 1–2 set ringan gerakan pertama (~50% usaha), fokus ROM penuh',
  ],
  lower: [
    'Mobilitas (2 mnt): putaran lengan 10x maju & 10x mundur, putaran pinggul 10x tiap arah, bodyweight good morning x10, walking knee hugs x10',
    'Aktivasi (2–3 mnt): glute bridge bodyweight x15, cat-cow x10',
    'Pemanasan spesifik (2–3 mnt): 1–2 set ringan gerakan pertama (~50% usaha), fokus ROM penuh',
  ],
};

export const REST_DAY_TIPS = ['Jalan santai 20–40 menit', 'Stretching ringan / mobilitas', 'Tidur 7,5–9 jam, penuhi kalori & protein'];

export interface WeekPhase {
  name: string;
  rirText: string;
  points: string[];
}

export function weekPhase(week: number): WeekPhase {
  if (week <= 2)
    return {
      name: 'Fondasi & Penguasaan Teknik',
      rirText: 'RIR 2 di semua set',
      points: ['Kuasai teknik & ROM penuh, belum sampai gagal', 'Tempo persis seperti tertulis', 'Belum pakai 1.5 reps / myo-reps / drop set', 'Finisher opsional'],
    };
  if (week <= 4)
    return {
      name: 'Tambah Teknik Intensitas',
      rirText: 'RIR 1',
      points: ['1.5 reps aktif di set terakhir gerakan bertanda', 'Finisher dilakukan penuh', 'Istirahat dikurangi ~10 detik'],
    };
  if (week <= 6)
    return {
      name: 'Dorong Menuju Kegagalan',
      rirText: 'RIR 0–1 di 1–2 set terakhir',
      points: ['Myo-reps & mechanical drop set aktif', 'Kalau 20+ reps terlalu mudah, pakai variasi lebih sulit', 'Istirahat dikurangi ~10 detik'],
    };
  if (week === 7)
    return {
      name: 'Minggu Intensitas Puncak',
      rirText: 'RIR 0 di set terakhir',
      points: ['Semua teknik aktif', 'Tambah rest-pause di 2 gerakan terlemah: gagal → 15 dtk → 2–3 reps → 15 dtk → 2–3 reps', 'Wajar terasa lelah di hari ke-6'],
    };
  return {
    name: 'Deload',
    rirText: 'RIR 3–4 (harus terasa ringan)',
    points: ['Volume ~60% (set dipotong)', 'Tanpa teknik intensitas', 'Lewati finisher', 'Pulihkan sendi & sistem saraf sebelum blok berikutnya'],
  };
}

export function programWorkouts(): Workout[] {
  return [
    {
      id: rid(),
      day: 1,
      focus: 'upper',
      name: 'Push A',
      subtitle: 'Dada / Bahu / Trisep',
      finisher: 'DB Front Raise myo-reps (3 mini-set 8–10 reps, istirahat 20 dtk) superset Push-Up burnout sampai gagal. 6–8 menit.',
      cooldown: 'Peregangan dada di pintu 30 dtk/sisi · trisep overhead 30 dtk/sisi · bahu cross-body 30 dtk/sisi · child’s pose 45 dtk.',
      exercises: [
        ex({
          name: 'DB Floor Press', muscles: ['Dada', 'Bahu depan', 'Trisep'], sets: 4, reps: [15, 20], tempo: '4111', rest: 75, rir: 1, attr: 'STR', technique: T15(),
          guide: {
            how: 'Berbaring telentang di lantai, lutut ditekuk, kaki menapak rata. Dumbbell setinggi dada, siku ~45° dari badan. Dorong ke atas sampai lengan lurus (jangan dikunci keras), turunkan perlahan sampai lengan atas menyentuh lantai.',
            mistakes: 'Siku melebar sampai 90° (berisiko cedera bahu); memantul di lantai; tidak mengontrol 5 cm terakhir saat turun.',
            easier: 'Kurangi ROM sedikit — pakai handuk terlipat di bawah lengan atas.',
            harder: '1.5 reps di set terakhir; eksentrik 5 detik; atau tekan dengan pinggul terangkat (posisi glute bridge).',
          },
        }),
        ex({
          name: 'DB Squeeze Floor Press', muscles: ['Dada dalam'], sets: 3, reps: [15, 20], tempo: '3211', rest: 60, rir: 1, rirLabel: '0–1', attr: 'STR',
          guide: {
            how: 'Posisi seperti floor press, tapi kedua dumbbell ditekan saling merapat (meremas) sepanjang gerakan.',
            mistakes: 'Tekanan meremas mengendur di tengah repetisi.',
            easier: 'Pakai objek lebih ringan di antara telapak tangan, atau kurangi reps.',
            harder: 'Jeda meremas 2 detik di puncak tiap repetisi.',
          },
        }),
        ex({
          name: 'Standing DB Shoulder Press', muscles: ['Bahu depan', 'Bahu samping', 'Trisep'], sets: 4, reps: [12, 15], tempo: '3111', rest: 75, rir: 1, attr: 'STR',
          guide: {
            how: 'Berdiri tegak, core kencang, dumbbell setinggi bahu, telapak menghadap depan. Dorong lurus ke atas tanpa melengkungkan punggung bawah, turunkan perlahan.',
            mistakes: 'Punggung bawah melengkung berlebihan; mendorong ke depan bukan lurus ke atas.',
            easier: 'Duduk di lantai bersandar ke dinding.',
            harder: 'Bergantian lengan (satu mendorong, satu menahan statis).',
          },
        }),
        ex({
          name: 'DB Lateral Raise', muscles: ['Bahu samping'], sets: 3, reps: [15, 20], tempo: '3111', rest: 60, rir: 0, attr: 'END', technique: MYO(),
          guide: {
            how: 'Siku sedikit ditekuk, angkat lengan setinggi bahu dengan siku memimpin, kelingking sedikit lebih tinggi dari jempol di puncak, jeda 1 detik, turunkan perlahan.',
            mistakes: 'Pakai momentum/ayunan; bahu terangkat (trapezius mengambil alih); mengangkat melebihi tinggi bahu.',
            easier: 'Kurangi ROM jadi 3/4, atau ganti bent-over lateral raise.',
            harder: '1.5 reps di posisi bawah atau eksentrik 4 detik.',
          },
        }),
        ex({
          name: 'Diamond Push-Up', muscles: ['Trisep', 'Dada dalam'], sets: 3, reps: [8, 15], tempo: '3111', rest: 60, rir: 0, attr: 'END', load: 0, mode: 'amrap',
          technique: DROP('Saat gagal, langsung turunkan lutut dan lanjut knee push-up sampai gagal, tanpa istirahat.'),
          guide: {
            how: 'Tangan membentuk berlian di bawah dada, turunkan dada ke tangan, siku mengarah ke belakang mengikuti rusuk.',
            mistakes: 'Siku melebar ke samping; pinggul turun; belum benar-benar gagal sebelum pindah posisi.',
            easier: 'Incline diamond push-up (tangan di anak tangga/kotak kokoh).',
            harder: 'Decline diamond push-up (kaki di anak tangga).',
          },
        }),
        ex({
          name: 'One-Arm DB Overhead Triceps Extension', muscles: ['Trisep (kepala panjang)'], sets: 3, reps: [15, 20], tempo: '4111', rest: 45, rir: 1, rirLabel: '0–1', attr: 'END', perSide: true,
          guide: {
            how: 'Duduk/berdiri, dumbbell overhead, turunkan perlahan ke belakang kepala dengan siku mengarah ke depan/atas, luruskan kembali penuh.',
            mistakes: 'Siku melebar keluar; ROM sebagian; punggung melengkung.',
            easier: 'Versi dua tangan memegang satu dumbbell.',
            harder: 'Satu lengan dengan 1.5 reps di posisi teregang bawah.',
          },
        }),
      ],
    },
    {
      id: rid(),
      day: 2,
      focus: 'upper',
      name: 'Pull A',
      subtitle: 'Punggung / Bisep / Bahu Belakang',
      finisher: 'Curl myo-reps (3 mini-set 8 reps, istirahat 20 dtk) superset Superman Hold isometrik 20–30 dtk x3. 6–8 menit.',
      cooldown: 'Child’s pose merentang 30 dtk · lat cross-body 30 dtk/sisi · bisep di pintu 30 dtk/sisi · cat-cow x8.',
      exercises: [
        ex({
          name: 'One-Arm DB Row', muscles: ['Lat', 'Punggung tengah'], sets: 4, reps: [15, 20], tempo: '3111', rest: 60, rir: 1, attr: 'STR', perSide: true, technique: T15(),
          guide: {
            how: 'Hinge di pinggul ~45°, tangan bebas bertumpu di kursi/lutut, tarik dumbbell ke arah pinggul dengan siku dekat badan, remas bahu di puncak, turunkan terkontrol 3 detik.',
            mistakes: 'Memutar badan untuk membantu; menarik ke dada bukan pinggul; terburu-buru saat eksentrik.',
            easier: 'Tumpu kedua tangan di kursi/meja, tarik bergantian dari posisi lebih tertopang.',
            harder: 'Jeda 1 detik di puncak tiap repetisi, atau 1.5 reps di set terakhir.',
          },
        }),
        ex({
          name: 'DB Renegade Row', muscles: ['Punggung', 'Core'], sets: 3, reps: [10, 12], tempo: '2120', rest: 60, rir: 1, attr: 'STR', perSide: true,
          guide: {
            how: 'Posisi plank memegang dumbbell di lantai, kaki dibuka lebar. Tarik satu dumbbell ke rusuk sambil pinggul tetap sejajar, letakkan kembali, ganti sisi.',
            mistakes: 'Pinggul berputar/turun; terlalu cepat sehingga kehilangan keseimbangan.',
            easier: 'Lakukan dari posisi lutut.',
            harder: 'Tambahkan push-up di antara tiap repetisi row.',
          },
        }),
        ex({
          name: 'DB Reverse Fly', muscles: ['Bahu belakang', 'Punggung atas'], sets: 4, reps: [15, 20], tempo: '3111', rest: 60, rir: 1, rirLabel: '0–1', attr: 'END',
          guide: {
            how: 'Hinge ke depan 45–60°, lutut sedikit ditekuk, angkat dumbbell ke samping dengan siku memimpin sampai sejajar badan, remas bahu, turunkan perlahan.',
            mistakes: 'Berdiri terlalu tegak (jadi shrug); pakai momentum; mengangkat di atas garis bahu.',
            easier: 'Duduk membungkuk dengan dada bertumpu di paha.',
            harder: 'Jeda remas 2 detik di puncak tiap repetisi.',
          },
        }),
        ex({
          name: 'Superman Pull', muscles: ['Erector punggung', 'Punggung atas'], sets: 3, reps: [15, 20], tempo: '2220', rest: 45, rir: 1, rirLabel: '0–1', attr: 'VIT', load: 0,
          guide: {
            how: 'Tengkurap, lengan lurus ke depan. Angkat dada, lengan, dan kaki bersamaan, tarik siku ke belakang seperti mendayung, remas punggung atas, luruskan, turunkan terkontrol.',
            mistakes: 'Hanya mengangkat kepala/leher; gerakan menyentak.',
            easier: 'Angkat lengan/kaki bergantian (gaya bird-dog).',
            harder: 'Tahan posisi remas puncak 3–5 detik tiap repetisi.',
          },
        }),
        ex({
          name: 'DB Bicep Curl', muscles: ['Bisep'], sets: 3, reps: [15, 20], tempo: '4111', rest: 45, rir: 0, attr: 'STR', technique: T15(),
          guide: {
            how: 'Siku menempel di sisi badan, angkat dumbbell dengan telapak menghadap atas, remas di puncak, turunkan 4 detik penuh.',
            mistakes: 'Mengayun siku/badan (cheat curl); tidak mengontrol eksentrik.',
            easier: 'Bergantian lengan, atau sandarkan siku ke badan/paha.',
            harder: '1.5 reps di rentang tengah tersulit pada set terakhir.',
          },
        }),
        ex({
          name: 'DB Hammer Curl', muscles: ['Bisep', 'Lengan bawah'], sets: 3, reps: [15, 20], tempo: '3111', rest: 45, rir: 0, attr: 'STR',
          guide: {
            how: 'Genggaman netral (telapak saling berhadapan), angkat dengan siku diam, remas di puncak, turunkan perlahan.',
            mistakes: 'Siku bergeser ke depan; bahu ikut membantu.',
            easier: 'Bergantian lengan.',
            harder: 'Jeda 2 detik di sudut 90° tiap repetisi.',
          },
        }),
      ],
    },
    {
      id: rid(),
      day: 3,
      focus: 'lower',
      name: 'Leg A',
      subtitle: 'Paha Depan / Belakang / Bokong / Betis / Core',
      finisher: 'Bodyweight squat burnout (AMRAP sampai gagal) superset DB Russian Twist 20–30 reps. 6–8 menit.',
      cooldown: 'Paha depan berdiri 30 dtk/sisi · forward fold duduk 30 dtk · bokong figure-4 30 dtk/sisi · betis di dinding 30 dtk/sisi.',
      exercises: [
        ex({
          name: 'DB Goblet Squat', muscles: ['Paha depan', 'Bokong'], sets: 4, reps: [15, 20], tempo: '4210', rest: 75, rir: 1, attr: 'STR', technique: T15(),
          guide: {
            how: 'Pegang satu dumbbell tegak di depan dada. Kaki selebar bahu, ujung kaki sedikit keluar. Squat dengan dada tegak sampai paha minimal sejajar lantai, dorong lewat tengah telapak kaki, remas bokong di puncak.',
            mistakes: 'Lutut jatuh ke dalam; tumit terangkat; badan terlalu condong ke depan.',
            easier: 'Kurangi kedalaman atau berpegangan ke permukaan stabil.',
            harder: 'Pause squat 3 detik di bawah, atau tempo 5-3-1-0.',
          },
        }),
        ex({
          name: 'DB Bulgarian Split Squat', muscles: ['Paha depan', 'Bokong'], sets: 3, reps: [12, 15], tempo: '3110', rest: 60, rir: 1, attr: 'AGI', perSide: true,
          guide: {
            how: 'Kaki belakang di anak tangga/kursi kokoh, kaki depan cukup jauh ke depan. Turun lurus sampai paha depan hampir sejajar, dorong naik lewat tumit depan.',
            mistakes: 'Jarak kaki terlalu pendek; badan terlalu condong; terlalu banyak mendorong dari kaki belakang.',
            easier: 'Reverse lunge biasa tanpa mengangkat kaki belakang.',
            harder: '1.5 reps di posisi bawah, atau eksentrik 5 detik.',
          },
        }),
        ex({
          name: 'DB Romanian Deadlift', muscles: ['Paha belakang', 'Bokong'], sets: 4, reps: [15, 20], tempo: '4110', rest: 75, rir: 1, attr: 'STR',
          guide: {
            how: 'Dumbbell di depan paha, lutut sedikit ditekuk. Hinge, dorong bokong ke belakang, dumbbell dekat kaki, turun sampai paha belakang teregang (~setinggi tulang kering), dorong pinggul ke depan, remas bokong.',
            mistakes: 'Punggung bawah membulat; lutut terlalu ditekuk (jadi squat); ROM terlalu pendek.',
            easier: 'Kurangi ROM sampai tepat di atas lutut.',
            harder: 'Single-leg RDL.',
          },
        }),
        ex({
          name: 'Single-Leg Glute Bridge', muscles: ['Bokong', 'Paha belakang'], sets: 3, reps: [15, 20], tempo: '2210', rest: 45, rir: 1, rirLabel: '0–1', attr: 'AGI', perSide: true, load: 0,
          guide: {
            how: 'Telentang, satu kaki menapak, kaki lain lurus/ditekuk ke dada. Dorong lewat tumit, angkat pinggul sampai bahu–lutut lurus, remas bokong, turunkan perlahan.',
            mistakes: 'Punggung bawah melengkung berlebihan; kaki terlalu jauh dari pinggul.',
            easier: 'Glute bridge dua kaki.',
            harder: 'Dumbbell di pinggul, atau jeda 2 detik di puncak.',
          },
        }),
        ex({
          name: 'DB Standing Calf Raise', muscles: ['Betis'], sets: 4, reps: [20, 25], tempo: '3211', rest: 45, rir: 0, attr: 'END', technique: T15(),
          guide: {
            how: 'Dumbbell di sisi badan, berdiri di tepi anak tangga, naik setinggi mungkin ke ujung jari, jeda, turunkan tumit di bawah netral untuk regangan dalam.',
            mistakes: 'Memantul; ROM sebagian.',
            easier: 'Di lantai rata, bodyweight saja.',
            harder: 'Single-leg calf raise, atau 1.5 reps + jeda 3 detik di puncak.',
          },
        }),
        ex({
          name: 'Plank', muscles: ['Core'], sets: 3, reps: [30, 45], tempo: '', rest: 45, rir: 1, rirLabel: '—', attr: 'VIT', load: 0, mode: 'hold',
          guide: {
            how: 'Lengan bawah & ujung kaki di lantai, badan satu garis lurus kepala–tumit, core kencang, remas bokong, bernapas stabil.',
            mistakes: 'Pinggul turun/terlalu tinggi; menahan napas.',
            easier: 'Knee plank.',
            harder: 'Dumbbell di punggung atas, atau angkat satu kaki/lengan bergantian.',
          },
        }),
      ],
    },
    {
      id: rid(),
      day: 4,
      focus: 'upper',
      name: 'Push B',
      subtitle: 'Dada / Bahu / Trisep',
      finisher: 'DB Lateral Raise myo-reps (3 mini-set 8 reps, istirahat 20 dtk) superset Push-Up burnout. 6–8 menit.',
      cooldown: 'Dada di pintu 30 dtk/sisi · downward-dog 30 dtk · trisep overhead 30 dtk/sisi · putaran leher x5.',
      exercises: [
        ex({
          name: 'Feet-Elevated Push-Up', muscles: ['Dada atas', 'Bahu'], sets: 4, reps: [12, 20], tempo: '4110', rest: 75, rir: 1, attr: 'STR', load: 0, mode: 'amrap',
          guide: {
            how: 'Kaki di anak tangga/kotak, tangan sedikit lebih lebar dari bahu, turunkan dada dengan siku ~45°, dorong kembali.',
            mistakes: 'Pinggul turun; siku melebar 90°; ROM tidak lengkap.',
            easier: 'Push-up lantai rata atau incline push-up.',
            harder: 'Tambah tinggi elevasi kaki, atau 1.5 reps.',
          },
        }),
        ex({
          name: 'DB Floor Fly', muscles: ['Dada'], sets: 4, reps: [15, 20], tempo: '4211', rest: 60, rir: 1, rirLabel: '0–1', attr: 'END',
          guide: {
            how: 'Berbaring di lantai, dumbbell di atas dada, siku sedikit ditekuk (tetap). Turunkan lengan ke samping sampai lengan atas menyentuh lantai, remas dada untuk menyatukan kembali.',
            mistakes: 'Menekuk siku lebih banyak (jadi press); terlalu cepat melewatkan regangan.',
            easier: 'Kurangi ROM jika bahu tidak nyaman.',
            harder: 'Jeda 2 detik di posisi regangan bawah.',
          },
        }),
        ex({
          name: 'Pike Push-Up', muscles: ['Bahu', 'Trisep'], sets: 3, reps: [10, 15], tempo: '3110', rest: 75, rir: 1, attr: 'STR', load: 0,
          guide: {
            how: 'Posisi downward-dog (V terbalik), tekuk siku untuk menurunkan puncak kepala ke lantai di antara tangan, dorong kembali.',
            mistakes: 'Pinggul kurang tinggi; siku terlalu melebar.',
            easier: 'Kurangi tinggi pinggul / menghadap dinding.',
            harder: 'Deficit pike push-up dengan kaki di anak tangga.',
          },
        }),
        ex({
          name: 'DB Arnold Press', muscles: ['Bahu depan', 'Bahu samping', 'Trisep'], sets: 3, reps: [12, 15], tempo: '3111', rest: 60, rir: 1, attr: 'STR',
          guide: {
            how: 'Dumbbell di depan bahu, telapak menghadap diri. Saat mendorong, putar telapak menghadap depan sampai overhead. Balik putaran saat turun.',
            mistakes: 'Terburu-buru saat memutar; punggung bawah melengkung.',
            easier: 'Shoulder press standar tanpa rotasi.',
            harder: 'Bergantian lengan, atau jeda 1 detik di posisi bawah.',
          },
        }),
        ex({
          name: 'Close-Grip Push-Up', muscles: ['Trisep', 'Dada dalam'], sets: 3, reps: [8, 15], tempo: '3110', rest: 60, rir: 0, attr: 'END', load: 0, mode: 'amrap',
          technique: DROP('Saat gagal, langsung lebarkan posisi tangan dan lanjut wide-hand push-up sampai gagal.'),
          guide: {
            how: 'Tangan tepat di bawah bahu, siku ke belakang mengikuti rusuk, turunkan dada ke lantai.',
            mistakes: 'Siku melebar keluar; ROM sebagian.',
            easier: 'Dari posisi lutut.',
            harder: 'Angkat kaki.',
          },
        }),
        ex({
          name: 'DB Triceps Kickback', muscles: ['Trisep'], sets: 3, reps: [15, 20], tempo: '3111', rest: 45, rir: 0, attr: 'END', perSide: true, technique: T15(),
          guide: {
            how: 'Hinge ke depan, lengan atas sejajar badan dan diam, luruskan lengan bawah ke belakang, remas trisep, turunkan terkontrol.',
            mistakes: 'Mengayun lengan atas; tidak mencapai ekstensi penuh.',
            easier: 'Topang badan ke dinding/kursi.',
            harder: 'Jeda remas 2 detik di ekstensi penuh, atau 1.5 reps.',
          },
        }),
      ],
    },
    {
      id: rid(),
      day: 5,
      focus: 'upper',
      name: 'Pull B',
      subtitle: 'Punggung / Bisep / Bahu Belakang',
      finisher: 'Curl drop-set: curl sampai gagal → langsung hammer curl sampai gagal, tanpa istirahat. 2 ronde.',
      cooldown: 'Child’s pose 30 dtk · jangkauan lat duduk 30 dtk · bisep di pintu 30 dtk/sisi · putaran bahu x10.',
      exercises: [
        ex({
          name: 'DB Bent-Over Row', muscles: ['Lat', 'Punggung tengah', 'Bisep'], sets: 4, reps: [15, 20], tempo: '3111', rest: 75, rir: 1, attr: 'STR', technique: T15(),
          guide: {
            how: 'Hinge ~45°, tulang belakang netral, tarik kedua dumbbell ke pinggul/rusuk bawah, remas bahu di puncak, turunkan 3 detik.',
            mistakes: 'Punggung membulat; terlalu tegak; menyentak beban.',
            easier: 'Satu lengan bergantian dengan tangan lain bertopang di kursi.',
            harder: 'Jeda 1 detik di puncak, atau 1.5 reps di set terakhir.',
          },
        }),
        ex({
          name: 'Prone Y-T-W Raise', muscles: ['Bahu belakang', 'Punggung atas', 'Rotator cuff'], sets: 3, reps: [12, 15], tempo: '2120', rest: 60, rir: 1, rirLabel: '0–1', attr: 'END', load: 0,
          guide: {
            how: 'Tengkurap, angkat lengan membentuk huruf Y (overhead, jempol ke atas), lalu T (lurus ke samping), lalu W (siku 90°, remas bahu). Reps dihitung tiap huruf.',
            mistakes: 'Pakai momentum; mengangkat kepala alih-alih meremas bahu.',
            easier: 'Tanpa beban.',
            harder: 'Pegang dumbbell sangat ringan + jeda 2 detik di puncak tiap posisi.',
          },
        }),
        ex({
          name: 'DB Pullover', muscles: ['Lat', 'Dada', 'Serratus'], sets: 4, reps: [15, 20], tempo: '4110', rest: 60, rir: 1, attr: 'STR',
          guide: {
            how: 'Berbaring di lantai, satu dumbbell dipegang dua tangan di atas dada, turunkan ke belakang kepala sampai lat/dada teregang, tarik kembali dengan lat.',
            mistakes: 'Menekuk siku terlalu banyak (jadi triceps extension); terburu-buru di fase regangan.',
            easier: 'Kurangi ROM.',
            harder: 'Pinggul diangkat dari lantai untuk regangan lebih dalam.',
          },
        }),
        ex({
          name: 'Superman Hold + Row', muscles: ['Punggung atas', 'Punggung bawah'], sets: 3, reps: [12, 15], tempo: '2120', rest: 45, rir: 1, rirLabel: '0–1', attr: 'VIT', load: 0,
          guide: {
            how: 'Dari posisi superman (dada & kaki terangkat), tarik siku ke belakang dan remas bahu, tanpa membiarkan dada jatuh di antara repetisi.',
            mistakes: 'Turun penuh di antara repetisi; gerakan menyentak.',
            easier: 'Istirahatkan dada sebentar di antara repetisi.',
            harder: 'Tahan tiap tarikan 2 detik.',
          },
        }),
        ex({
          name: 'DB Concentration Curl', muscles: ['Bisep'], sets: 3, reps: [15, 20], tempo: '4111', rest: 45, rir: 0, attr: 'STR', perSide: true, technique: T15(),
          guide: {
            how: 'Duduk, siku bersandar di paha dalam, angkat dumbbell penuh, remas bisep di puncak, turunkan 4 detik.',
            mistakes: 'Siku bergeser dari paha; badan mengayun.',
            easier: 'Kurangi ROM jika siku tidak nyaman.',
            harder: '1.5 reps di rentang kontraksi puncak.',
          },
        }),
        ex({
          name: 'DB Zottman Curl', muscles: ['Bisep', 'Lengan bawah'], sets: 3, reps: [12, 15], tempo: '3121', rest: 45, rir: 0, attr: 'STR',
          guide: {
            how: 'Curl dengan telapak menghadap atas, putar telapak menghadap bawah di puncak, turunkan perlahan dalam posisi pronasi, putar kembali di bawah.',
            mistakes: 'Terburu-buru saat rotasi; eksentrik pronasi tidak terkontrol.',
            easier: 'Bicep curl standar tanpa rotasi.',
            harder: 'Eksentrik pronasi 5 detik.',
          },
        }),
      ],
    },
    {
      id: rid(),
      day: 6,
      focus: 'lower',
      name: 'Leg B',
      subtitle: 'Paha Depan / Belakang / Bokong / Betis / Core',
      finisher: 'Bodyweight walking lunge burnout (AMRAP) superset Plank hold sampai mendekati gagal. 6–8 menit.',
      cooldown: 'Hip flexor berlutut 30 dtk/sisi · forward fold 30 dtk · bokong figure-4 30 dtk/sisi · betis 30 dtk/sisi.',
      exercises: [
        ex({
          name: 'DB Reverse Lunge', muscles: ['Paha depan', 'Bokong'], sets: 4, reps: [12, 15], tempo: '3110', rest: 75, rir: 1, attr: 'AGI', perSide: true,
          guide: {
            how: 'Langkahkan satu kaki ke belakang, turun sampai lutut belakang hampir menyentuh lantai dan paha depan sejajar, dorong lewat tumit depan untuk kembali.',
            mistakes: 'Langkah terlalu pendek; badan terlalu condong; lutut depan jatuh ke dalam.',
            easier: 'Split squat statis.',
            harder: 'Walking lunge, atau 1.5 reps di posisi bawah.',
          },
        }),
        ex({
          name: 'DB Step-Up', muscles: ['Paha depan', 'Bokong'], sets: 3, reps: [12, 15], tempo: '2110', rest: 60, rir: 1, attr: 'AGI', perSide: true,
          guide: {
            how: 'Naik penuh ke anak tangga/kotak stabil dengan satu kaki, dorong lewat tumit kaki itu sampai berdiri tegak, turun terkontrol.',
            mistakes: 'Mendorong dari kaki belakang; anak tangga terlalu tinggi.',
            easier: 'Kurangi tinggi anak tangga.',
            harder: 'Eksentrik 4–5 detik saat turun, atau tambah tinggi.',
          },
        }),
        ex({
          name: 'Single-Leg RDL', muscles: ['Paha belakang', 'Bokong'], sets: 3, reps: [12, 15], tempo: '4110', rest: 60, rir: 1, attr: 'AGI', perSide: true,
          guide: {
            how: 'Berdiri satu kaki, lutut sedikit ditekuk, hinge sambil meluruskan kaki lain ke belakang, dumbbell turun ke lantai, kembali dengan mendorong pinggul dan meremas bokong.',
            mistakes: 'Punggung membulat; pinggul berputar; terburu-buru.',
            easier: 'Sentuh dinding/kursi untuk keseimbangan.',
            harder: 'Perlambat eksentrik lebih jauh.',
          },
        }),
        ex({
          name: 'DB Hip Thrust', muscles: ['Bokong'], sets: 4, reps: [15, 20], tempo: '2211', rest: 60, rir: 1, rirLabel: '0–1', attr: 'STR', technique: T15(),
          guide: {
            how: 'Punggung atas di lantai/anak tangga rendah, dumbbell di pinggul, dorong pinggul naik sampai bahu–lutut lurus, remas bokong kuat, turunkan terkontrol.',
            mistakes: 'Punggung bawah melengkung; posisi kaki terlalu jauh/dekat.',
            easier: 'Glute bridge bodyweight.',
            harder: 'Single-leg hip thrust, atau jeda 3 detik di puncak.',
          },
        }),
        ex({
          name: 'Single-Leg Calf Raise', muscles: ['Betis'], sets: 3, reps: [15, 20], tempo: '3211', rest: 45, rir: 0, attr: 'END', perSide: true, load: 0,
          guide: {
            how: 'Berdiri satu kaki (boleh pegang dumbbell), naik ke ujung jari setinggi mungkin, jeda, turunkan tumit di bawah netral.',
            mistakes: 'Memantul; ROM tidak penuh.',
            easier: 'Calf raise dua kaki.',
            harder: '1.5 reps + jeda 3 detik di puncak pada set terakhir.',
          },
        }),
        ex({
          name: 'Hollow Body Hold', muscles: ['Core'], sets: 3, reps: [20, 30], tempo: '', rest: 45, rir: 1, rirLabel: '—', attr: 'VIT', load: 0, mode: 'hold',
          guide: {
            how: 'Telentang, tekan punggung bawah ke lantai, angkat bahu & kaki sedikit, lengan lurus overhead/di samping, tahan tegang. Alternatif: DB weighted sit-up 15–20 reps.',
            mistakes: 'Punggung bawah terangkat dari lantai; menyentak leher saat sit-up.',
            easier: 'Tekuk lutut (variasi dead bug).',
            harder: 'Luruskan lengan/kaki lebih jauh, atau sit-up dengan dumbbell.',
          },
        }),
      ],
    },
  ];
}
