# Graph Report - fittyfit  (2026-11-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 601 nodes · 2034 edges · 33 communities (21 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `54d000cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Logika Game: XP, Atribut, Quest & Gelar
- Tanggal, Streak & Aturan Lockdown
- Mesin Animasi Gerakan
- UI Kit, Tema & Navigasi Tab
- Program 8 Minggu & Data Awal
- Modul Native Lockdown (Kotlin)
- Root Layout, Daemon & Notifikasi
- Konfigurasi app.json
- Render GIF Gerakan (Python)
- Dependensi Runtime
- package.json & Dependensi Lain
- Skrip npm
- Generator Ikon Aplikasi
- Konfigurasi TypeScript
- Paket modul shadow-lock
- Logika Game: XP, Atribut, Quest & Gelar (2)
- Model Data & State Store
- Dependensi: expo-file-system
- Dependensi: expo-constants
- Jadwal Notifikasi & Hari Latihan
- Dependensi: @expo-google-fonts/chivo
- Dependensi: @expo-google-fonts/manrope
- Lockdown & Notifikasi (JS)
- Dependensi: @expo-google-fonts/jetbrains-mono
- Penalty Quest & Rest Pass
- Dependensi: expo-image
- Logika Game: XP, Atribut, Quest & Gelar (3)
- Dependensi: expo-font
- Dependensi: expo-splash-screen
- Dependensi: react-native-keyboard-controller
- Dependensi: expo-notifications
- Dependensi: expo-status-bar

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 49 edges
2. `useStore()` - 48 edges
3. `dayKey()` - 46 edges
4. `Body` - 38 edges
5. `StatusScreen()` - 37 edges
6. `Label` - 35 edges
7. `Button()` - 31 edges
8. `Card()` - 31 edges
9. `Mono` - 31 edges
10. `Screen()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `LockScreen()` --calls--> `nativeLockedNow()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `openAllowedApp()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `stopLockTest()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `Daemon()` --calls--> `setLockConfig()`  [EXTRACTED]
  src/app/_layout.tsx → modules/shadow-lock/index.ts
- `CrystalDef` --references--> `Attr`  [EXTRACTED]
  src/store/logic.ts → src/store/types.ts

## Import Cycles
- None detected.

## Communities (33 total, 12 thin omitted)

### Community 0 - "Logika Game: XP, Atribut, Quest & Gelar"
Cohesion: 0.09
Nodes (103): expo-router, GrowthScreen(), persistPhoto(), styles, LockScreen(), PenaltyScreen(), PlankTimer(), styles (+95 more)

### Community 1 - "Tanggal, Streak & Aturan Lockdown"
Cohesion: 0.24
Nodes (19): APPS, styles, dayKey(), Deadline, EMERGENCY_PHRASE, EMERGENCY_WAIT_SEC, lockActiveNow(), lockPendingToday() (+11 more)

### Community 2 - "Mesin Animasi Gerakan"
Cohesion: 0.06
Nodes (56): display, out, tempoOf, add(), angleOf(), COLORS, CONTACT, cycleLength() (+48 more)

### Community 3 - "UI Kit, Tema & Navigasi Tab"
Cohesion: 0.09
Nodes (40): react, react-native, react-native-svg, Onboarding(), styles, styles, styles, TABS (+32 more)

### Community 4 - "Program 8 Minggu & Data Awal"
Cohesion: 0.15
Nodes (18): DROP(), DUMBBELL_KG, ex(), ExIn, MYO(), PROGRAM_NAME, PROGRAM_WEEKS, programWorkouts() (+10 more)

### Community 5 - "Modul Native Lockdown (Kotlin)"
Cohesion: 0.07
Nodes (4): AllowList, LockPolicy, ShadowLockModule, ShadowLockService

### Community 6 - "Root Layout, Daemon & Notifikasi"
Cohesion: 0.25
Nodes (13): Daemon(), Gate(), RootLayout(), theme, cancelRestDone(), configureNotifications(), ensurePermission(), notificationsSupported (+5 more)

### Community 7 - "Konfigurasi app.json"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+21 more)

### Community 8 - "Render GIF Gerakan (Python)"
Cohesion: 0.18
Nodes (10): candidates(), main(), name_for(), rel(), draw_frame(), font(), hex_rgb(), main() (+2 more)

### Community 9 - "Dependensi Runtime"
Cohesion: 0.09
Nodes (23): dependencies, expo@~58.0.25, expo-haptics@~58.0.8, expo-image-picker@~58.0.10, expo-keep-awake@~58.0.4, expo-linear-gradient@~58.0.4, expo-router@~58.0.31, react@19.3.0 (+15 more)

### Community 10 - "package.json & Dependensi Lain"
Cohesion: 0.08
Nodes (25): expo-blur@~58.0.6, expo-linking@~58.0.17, expo-system-ui@~58.0.7, @expo/vector-icons@^15.1.1, @react-native-async-storage/async-storage@^2.2.0, react-native-reanimated@4.7.1, react-native-safe-area-context@~5.11.1, react-native-web@~0.21.4 (+17 more)

### Community 11 - "Skrip npm"
Cohesion: 0.17
Nodes (12): scripts, android, build:apk, build:web, gifs, graph, icons, ios (+4 more)

### Community 12 - "Generator Ikon Aplikasi"
Cohesion: 0.22
Nodes (7): background(), { chromium }, emblem(), files, hexPoints(), OUT, path

### Community 13 - "Konfigurasi TypeScript"
Cohesion: 0.22
Nodes (8): expo/tsconfig.base, compilerOptions, paths, strict, extends, include, @/assets/*, @modules/*

### Community 14 - "Paket modul shadow-lock"
Cohesion: 0.33
Nodes (5): description, main, name, private, version

### Community 15 - "Logika Game: XP, Atribut, Quest & Gelar (2)"
Cohesion: 0.08
Nodes (24): ATTR_LABEL, ATTR_POINTS_PER_LEVEL, attributes(), attrPoints(), CrystalDef, CRYSTALS, DAY_SHORT, KG_TO_LBS (+16 more)

### Community 16 - "Model Data & State Store"
Cohesion: 0.19
Nodes (15): initialState(), newProgramInfo(), computeSessionXp(), TitleDef, restPassBlock(), Ctx, makeActions(), StoreContext (+7 more)

### Community 19 - "Jadwal Notifikasi & Hari Latihan"
Cohesion: 0.24
Nodes (13): at(), Planned, planNotifications(), addDays(), pad(), weekKey(), weekStart(), currentStreak() (+5 more)

### Community 22 - "Lockdown & Notifikasi (JS)"
Cohesion: 0.09
Nodes (25): AllowedApp, isServiceEnabled(), lockSupported, Native, nativeLockedNow(), openAccessibilitySettings(), openAllowedApp(), openAppDetails() (+17 more)

### Community 24 - "Penalty Quest & Rest Pass"
Cohesion: 0.22
Nodes (10): DEBUFF_FACTOR, DEBUFF_SESSIONS, evaluateDaily(), focusOf(), PENALTY_SETS, PenaltyExercise, PLANK, roundsForWeek() (+2 more)

### Community 26 - "Logika Game: XP, Atribut, Quest & Gelar (3)"
Cohesion: 0.52
Nodes (7): parseDay(), activeDays(), isScheduledRest(), longestStreak(), streakStart(), trainingDays(), weekGrid()

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 167 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Kit, Tema & Navigasi Tab` to `Logika Game: XP, Atribut, Quest & Gelar`, `Tanggal, Streak & Aturan Lockdown`, `Mesin Animasi Gerakan`, `Root Layout, Daemon & Notifikasi`, `Dependensi Runtime`, `package.json & Dependensi Lain`, `Model Data & State Store`, `Lockdown & Notifikasi (JS)`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `Logika Game: XP, Atribut, Quest & Gelar` be split into smaller, more focused modules?**
  _Cohesion score 0.0897597977243995 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `UI Kit, Tema & Navigasi Tab` to `Logika Game: XP, Atribut, Quest & Gelar`, `Tanggal, Streak & Aturan Lockdown`, `Mesin Animasi Gerakan`, `Root Layout, Daemon & Notifikasi`, `Dependensi Runtime`, `package.json & Dependensi Lain`, `Lockdown & Notifikasi (JS)`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Mesin Animasi Gerakan` be split into smaller, more focused modules?**
  _Cohesion score 0.06398730830248546 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Skrip npm` to `package.json & Dependensi Lain`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `UI Kit, Tema & Navigasi Tab` be split into smaller, more focused modules?**
  _Cohesion score 0.09049773755656108 - nodes in this community are weakly interconnected._