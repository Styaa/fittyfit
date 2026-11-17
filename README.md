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
