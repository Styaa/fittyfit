# Graph Report - fittyfit  (2026-11-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 697 nodes · 2442 edges · 26 communities (21 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4f5e84aa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Kit, Tema & Navigasi Tab
- Tanggal, Streak & Aturan Lockdown
- Mesin Animasi Gerakan
- Kode: tracker.ts
- Model Data & State Store
- Modul Native Lockdown (Kotlin)
- Logika Game: XP, Atribut, Quest & Gelar
- Konfigurasi app.json
- Render GIF Gerakan (Python)
- package.json & Dependensi Lain
- Layar Aplikasi & Sesi Latihan
- Skrip npm
- Generator Ikon Aplikasi
- Konfigurasi TypeScript
- Paket modul shadow-lock
- Penalty Quest & Rest Pass
- Jadwal Notifikasi & Hari Latihan
- Dependensi: @react-native-async-storage/async-storage
- Dependensi: @expo-google-fonts/chivo
- Dependensi: expo-font
- Lockdown & Notifikasi (JS)
- Dependensi Runtime
- Dependensi: react-native-keyboard-controller
- Root Layout, Daemon & Notifikasi
- Dependensi: expo-splash-screen

## God Nodes (most connected - your core abstractions)
1. `useStore()` - 57 edges
2. `Icon()` - 56 edges
3. `dayKey()` - 48 edges
4. `Label` - 47 edges
5. `Body` - 44 edges
6. `Button()` - 39 edges
7. `StatusScreen()` - 37 edges
8. `Card()` - 37 edges
9. `Mono` - 37 edges
10. `Screen()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `SystemScreen()` --calls--> `isServiceEnabled()`  [EXTRACTED]
  src/app/(tabs)/system.tsx → modules/shadow-lock/index.ts
- `SystemScreen()` --calls--> `startLockTest()`  [EXTRACTED]
  src/app/(tabs)/system.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `nativeLockedNow()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `openAllowedApp()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `stopLockTest()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts

## Import Cycles
- None detected.

## Communities (26 total, 5 thin omitted)

### Community 0 - "UI Kit, Tema & Navigasi Tab"
Cohesion: 0.08
Nodes (126): expo-router, react, react-native, react-native-svg, GrowthScreen(), persistPhoto(), styles, Onboarding() (+118 more)

### Community 1 - "Tanggal, Streak & Aturan Lockdown"
Cohesion: 0.29
Nodes (13): Deadline, EMERGENCY_PHRASE, EMERGENCY_WAIT_SEC, lockActiveNow(), lockDays(), lockPendingToday(), lockStartToday(), nextDeadline() (+5 more)

### Community 2 - "Mesin Animasi Gerakan"
Cohesion: 0.06
Nodes (57): display, out, tempoOf, add(), angleOf(), COLORS, CONTACT, cycleLength() (+49 more)

### Community 3 - "Kode: tracker.ts"
Cohesion: 0.06
Nodes (61): expo-haptics, confirmBox(), START_ERRORS, Stat(), styles, WalkScreen(), styles, WalkBanner() (+53 more)

### Community 4 - "Model Data & State Store"
Cohesion: 0.07
Nodes (44): initialState(), newProgramInfo(), TitleDef, DEBUFF_FACTOR, REST_PASS_PRICE, DROP(), DUMBBELL_KG, ex() (+36 more)

### Community 5 - "Modul Native Lockdown (Kotlin)"
Cohesion: 0.07
Nodes (4): AllowList, LockPolicy, ShadowLockModule, ShadowLockService

### Community 6 - "Logika Game: XP, Atribut, Quest & Gelar"
Cohesion: 0.06
Nodes (35): ATTR_ICON, ATTR_INFO, AttrInfo, crystalsForAttr(), exercisesForAttr(), ATTR_LABEL, ATTR_POINTS_PER_LEVEL, attrPoints() (+27 more)

### Community 7 - "Konfigurasi app.json"
Cohesion: 0.06
Nodes (35): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, web (+27 more)

### Community 8 - "Render GIF Gerakan (Python)"
Cohesion: 0.18
Nodes (10): candidates(), main(), name_for(), rel(), draw_frame(), font(), hex_rgb(), main() (+2 more)

### Community 9 - "package.json & Dependensi Lain"
Cohesion: 0.07
Nodes (29): expo@~58.0.25, expo-blur@~58.0.6, expo-image-picker@~58.0.10, expo-keep-awake@~58.0.4, expo-linear-gradient@~58.0.4, expo-linking@~58.0.17, expo-task-manager@~58.0.14, react-native-gesture-handler@~3.3.0 (+21 more)

### Community 10 - "Layar Aplikasi & Sesi Latihan"
Cohesion: 0.31
Nodes (8): ask(), ProgramScreen(), styles, blank(), fmtShortDate(), uid(), DAY_NAMES, TodayPlan

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

### Community 15 - "Penalty Quest & Rest Pass"
Cohesion: 0.18
Nodes (27): addDays(), dayKey(), pad(), parseDay(), weekKey(), weekStart(), activeDays(), currentStreak() (+19 more)

### Community 16 - "Jadwal Notifikasi & Hari Latihan"
Cohesion: 0.36
Nodes (7): at(), Planned, planNotifications(), PREFIX, programWeek(), QUESTS, weekPhase()

### Community 21 - "Dependensi: expo-font"
Cohesion: 0.14
Nodes (8): expo-font@~58.0.12, @expo-google-fonts/manrope@^0.4.3, expo-status-bar@~58.0.5, react-native-safe-area-context@~5.11.1, expo-font, @expo-google-fonts/manrope, expo-status-bar, react-native-safe-area-context

### Community 22 - "Lockdown & Notifikasi (JS)"
Cohesion: 0.11
Nodes (21): AllowedApp, isServiceEnabled(), lockSupported, Native, nativeLockedNow(), openAccessibilitySettings(), openAllowedApp(), openAppDetails() (+13 more)

### Community 27 - "Dependensi Runtime"
Cohesion: 0.08
Nodes (26): dependencies, expo-constants@~58.0.16, expo-file-system@~58.0.13, @expo-google-fonts/jetbrains-mono@^0.4.1, expo-haptics@~58.0.8, expo-image@~58.0.18, expo-location@~58.0.22, expo-router@~58.0.31 (+18 more)

### Community 30 - "Root Layout, Daemon & Notifikasi"
Cohesion: 0.20
Nodes (16): setLockConfig(), expo-notifications@~58.1.9, expo-notifications, Daemon(), Gate(), RootLayout(), theme, RestBanner() (+8 more)

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 190 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `UI Kit, Tema & Navigasi Tab` to `Mesin Animasi Gerakan`, `Kode: tracker.ts`, `package.json & Dependensi Lain`, `Layar Aplikasi & Sesi Latihan`, `Lockdown & Notifikasi (JS)`, `Dependensi Runtime`, `Root Layout, Daemon & Notifikasi`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `UI Kit, Tema & Navigasi Tab` be split into smaller, more focused modules?**
  _Cohesion score 0.07771875873637125 - nodes in this community are weakly interconnected._
- **Why does `react` connect `UI Kit, Tema & Navigasi Tab` to `Mesin Animasi Gerakan`, `Kode: tracker.ts`, `Model Data & State Store`, `package.json & Dependensi Lain`, `Layar Aplikasi & Sesi Latihan`, `Lockdown & Notifikasi (JS)`, `Dependensi Runtime`, `Root Layout, Daemon & Notifikasi`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Mesin Animasi Gerakan` be split into smaller, more focused modules?**
  _Cohesion score 0.0629800307219662 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Skrip npm` to `package.json & Dependensi Lain`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `Kode: tracker.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06421052631578947 - nodes in this community are weakly interconnected._