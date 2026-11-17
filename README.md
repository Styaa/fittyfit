# Shadow Fit (fittyfit)

Aplikasi pendamping latihan beban bergaya RPG dark fantasy. Latihanmu jadi "dungeon", progres jadi XP, level, rank, atribut, gelar, dan quest.
Dibangun dengan **Expo (React Native) + Expo Router**, jadi satu kode jalan di **Android, iOS, dan web**. Semua data disimpan **lokal di perangkat** (AsyncStorage / localStorage di web).

## Fitur

| Layar | Isi |
|---|---|
| **Onboarding** | Identity Configuration: call sign, tinggi, berat, usia |
| **Status** | Level, XP, rank, gelar aktif, radar atribut (STR/AGI/END/VIT/DIS), streak mingguan, tombol *Enter Dungeon* |
| **Quests** | *Today's Dungeon* (latihan hari ini, rotasi otomatis) dan *Quest Board* (quest harian/mingguan/epic, terima → progres otomatis → klaim XP & koin) |
| **Sesi latihan** | Daftar latihan dengan timer sesi, **tempo timer** (ECC–PAUSE–CON–PAUSE, hitung rep otomatis, getar tiap fase), log reps/beban/RIR, **rest timer** (+15s / skip), ringkasan XP & PR baru |
| **Hall** | Gelar (bisa di-equip), Resonance Crystals (terbuka dari atribut), rekor pribadi (PR) dengan estimasi 1RM |
| **Growth** | Grafik berat badan, longest streak, total volume, time under tension, PR siklus ini, foto progres |
| **System** | Edit profil & avatar, satuan kg/lbs, haptics, editor program (dungeon & latihan), export/import backup JSON, reset data |

## Program Hipertrofi 8 Minggu (bawaan)

Program latihan di rumah dengan dumbbell ringan (5 kg), tanpa bench/barbel/pull-up bar, sudah terpasang otomatis:

| Hari | Dungeon |
|---|---|
| Senin | Push A — Dada / Bahu / Trisep |
| Selasa | Pull A — Punggung / Bisep / Bahu Belakang |
| Rabu | Leg A — Paha / Bokong / Betis / Core |
| Kamis | Push B |
| Jumat | Pull B |
| Sabtu | Leg B |
| Minggu | Istirahat |

**Menyesuaikan otomatis setiap hari:**
- Dungeon hari ini dipilih sesuai hari (Minggu = rest day).
- Minggu program dihitung dari tanggal mulai, dan resep berubah tiap fase:
  - Minggu 1–2: RIR 2, belum ada teknik intensitas, finisher opsional
  - Minggu 3–4: RIR 1, 1.5 reps aktif di set terakhir, istirahat −10 detik
  - Minggu 5–6: RIR sesuai tabel (0–1), myo-reps & mechanical drop set aktif
  - Minggu 7: RIR 0 di set terakhir, semua teknik aktif
  - Minggu 8: deload (set ~60%, RIR 3–4, tanpa teknik & finisher)
- Setiap gerakan punya panduan: cara melakukan, kesalahan umum, alternatif lebih mudah, progresi lebih sulit.
- Tanda **"Siap naik level"** muncul jika dua sesi berturut-turut mencapai batas atas reps di semua set dengan RIR ≥ 1.
- Pemanasan, finisher, dan pendinginan tampil di tiap dungeon.

Minggu program bisa digeser atau diulang di **System → Program & Dungeons**.

### Contoh gerakan (animasi)

Setiap gerakan punya **animasi vektor** yang diputar sesuai tempo program (fase TURUN / JEDA / NAIK):
- Di aplikasi: ketuk gerakan mana pun → animasi tampil di atas panduan. Animasi juga tampil di layar istirahat untuk set berikutnya. Ketuk untuk pause, tombol 1×/2× untuk kecepatan.
- Sebagai GIF: lihat galeri di [`docs/gerakan`](docs/gerakan/README.md).

Definisi pose ada di `src/anim/moves.ts`. Untuk membuat ulang GIF: `npm run gifs` (butuh Python + Pillow).

## Menjalankan di HP (paling mudah)

1. Pasang **Expo Go** dari Play Store / App Store.
2. Di komputer (butuh Node.js 20+):

   ```bash
   npm install
   npx expo start
   ```

3. Scan QR code yang muncul dengan Expo Go (Android) atau aplikasi Kamera (iOS). HP dan komputer harus di jaringan Wi-Fi yang sama, atau jalankan `npx expo start --tunnel`.

## Menjalankan di browser

```bash
npx expo start --web
```

Build statis (bisa di-hosting di mana saja, mis. GitHub Pages / Netlify / Vercel):

```bash
npm run build:web   # hasil di folder dist/
```

## Membuat APK (opsional)

Gunakan EAS Build (butuh akun Expo gratis):

```bash
npx eas-cli@latest build -p android --profile preview
```

## Struktur

```
src/
  app/                 # layar (Expo Router)
    (tabs)/            # Status, Quests, Hall, System
    onboarding.tsx
    session.tsx        # sesi latihan: overview → tempo set → log → rest → summary
    growth.tsx
    program.tsx, workout/[id].tsx
  components/          # UI kit sesuai DESIGN.md (Card, Button, Tag, ProgressBar, Radar, Ring, ...)
  store/               # state + penyimpanan lokal, logika XP/level/streak/PR/quest/gelar
  theme.ts             # token warna, font, spacing
```

## Catatan

- Data hanya ada di perangkat. Gunakan **System → Export backup** secara rutin.
- Tempo ditulis 4 digit, mis. `3010` = turun 3 detik, jeda 0, naik 1 detik, jeda 0. Kosongkan untuk latihan tanpa tempo (mis. plank).
