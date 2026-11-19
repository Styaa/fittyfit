# Graph Report - fittyfit  (2026-11-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 573 nodes · 1890 edges · 39 communities (15 shown, 24 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b440625`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Layar Aplikasi & Sesi Latihan
- Logika Game: XP, Streak, Quest, Penalti
- Mesin Animasi Gerakan
- Lockdown & Notifikasi (JS)
- Model Data & Program 8 Minggu
- Modul Native Lockdown (Kotlin)
- UI Kit, Tema & Navigasi Tab
- Konfigurasi app.json
- Render GIF Gerakan (Python)
- Dependensi Runtime
- package.json & DevDependencies
- Skrip npm
- Generator Ikon Aplikasi
- Konfigurasi TypeScript
- Paket modul shadow-lock
- Dependensi: expo
- Dependensi: expo-constants
- Dependensi: expo-file-system
- Dependensi: expo-font
- Dependensi: @expo-google-fonts/chivo
- Dependensi: @expo-google-fonts/jetbrains-mono
- Dependensi: @expo-google-fonts/manrope
- Dependensi: expo-haptics
- Dependensi: expo-image
- Dependensi: expo-image-picker
- Dependensi: expo-keep-awake
- Dependensi: expo-linear-gradient
- Dependensi: expo-linking
- Dependensi: expo-splash-screen
- Dependensi: expo-status-bar
- Dependensi: expo-system-ui
- Dependensi: @expo/vector-icons
- Dependensi: @react-native-async-storage/async-storage
- Dependensi: react-native-gesture-handler
- Dependensi: react-native-safe-area-context
- Dependensi: react-native-screens
- Dependensi: react-native-web
- Dependensi: react-native-worklets

## God Nodes (most connected - your core abstractions)
1. `dayKey()` - 45 edges
2. `Icon()` - 43 edges
3. `useStore()` - 42 edges
4. `StatusScreen()` - 36 edges
5. `Body` - 36 edges
6. `Label` - 33 edges
7. `Button()` - 31 edges
8. `Card()` - 31 edges
9. `Mono` - 29 edges
10. `Screen()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `LockScreen()` --calls--> `nativeLockedNow()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `openAllowedApp()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `stopLockTest()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `SystemScreen()` --calls--> `isServiceEnabled()`  [EXTRACTED]
  src/app/(tabs)/system.tsx → modules/shadow-lock/index.ts
- `SystemScreen()` --calls--> `startLockTest()`  [EXTRACTED]
  src/app/(tabs)/system.tsx → modules/shadow-lock/index.ts

## Import Cycles
- None detected.

## Communities (39 total, 24 thin omitted)

### Community 0 - "Layar Aplikasi & Sesi Latihan"
Cohesion: 0.12
Nodes (84): GrowthScreen(), persistPhoto(), styles, LockScreen(), Onboarding(), PenaltyScreen(), PlankTimer(), styles (+76 more)

### Community 1 - "Logika Game: XP, Streak, Quest, Penalti"
Cohesion: 0.06
Nodes (78): ask(), ProgramScreen(), styles, styles, Tab, confirmBox(), RestPassControl(), styles (+70 more)

### Community 2 - "Mesin Animasi Gerakan"
Cohesion: 0.06
Nodes (54): display, out, tempoOf, add(), angleOf(), COLORS, CONTACT, cycleLength() (+46 more)

### Community 3 - "Lockdown & Notifikasi (JS)"
Cohesion: 0.07
Nodes (37): AllowedApp, isServiceEnabled(), lockSupported, Native, nativeLockedNow(), openAccessibilitySettings(), openAllowedApp(), openAppDetails() (+29 more)

### Community 4 - "Model Data & Program 8 Minggu"
Cohesion: 0.07
Nodes (44): initialState(), newProgramInfo(), uid(), computeSessionXp(), CrystalDef, TitleDef, DEBUFF_FACTOR, DROP() (+36 more)

### Community 5 - "Modul Native Lockdown (Kotlin)"
Cohesion: 0.07
Nodes (4): AllowList, LockPolicy, ShadowLockModule, ShadowLockService

### Community 6 - "UI Kit, Tema & Navigasi Tab"
Cohesion: 0.11
Nodes (31): expo-router, react, react-native, react-native-svg, styles, ATTR_ICON, styles, styles (+23 more)

### Community 7 - "Konfigurasi app.json"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+21 more)

### Community 8 - "Render GIF Gerakan (Python)"
Cohesion: 0.27
Nodes (6): draw_frame(), font(), hex_rgb(), main(), mix(), slug()

### Community 9 - "Dependensi Runtime"
Cohesion: 0.15
Nodes (13): dependencies, expo-blur@~58.0.6, expo-router@~58.0.31, react@19.3.0, react-dom@19.3.0, react-native@0.88.1, react-native-keyboard-controller@^1.22.7, react-native-reanimated@4.7.1 (+5 more)

### Community 10 - "package.json & DevDependencies"
Cohesion: 0.20
Nodes (11): expo-notifications@~58.1.9, devDependencies, @types/react@~19.3.0, typescript@~6.0.3, main, name, private, version (+3 more)

### Community 11 - "Skrip npm"
Cohesion: 0.18
Nodes (11): scripts, android, build:apk, build:web, gifs, icons, ios, lint (+3 more)

### Community 12 - "Generator Ikon Aplikasi"
Cohesion: 0.22
Nodes (7): background(), { chromium }, emblem(), files, hexPoints(), OUT, path

### Community 13 - "Konfigurasi TypeScript"
Cohesion: 0.22
Nodes (8): expo/tsconfig.base, compilerOptions, paths, strict, extends, include, @/assets/*, @modules/*

### Community 14 - "Paket modul shadow-lock"
Cohesion: 0.33
Nodes (5): description, main, name, private, version

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 161 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Kit, Tema & Navigasi Tab` to `Layar Aplikasi & Sesi Latihan`, `Logika Game: XP, Streak, Quest, Penalti`, `Lockdown & Notifikasi (JS)`, `Model Data & Program 8 Minggu`, `Dependensi Runtime`, `package.json & DevDependencies`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `Layar Aplikasi & Sesi Latihan` be split into smaller, more focused modules?**
  _Cohesion score 0.11535580524344569 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `UI Kit, Tema & Navigasi Tab` to `Layar Aplikasi & Sesi Latihan`, `Logika Game: XP, Streak, Quest, Penalti`, `Lockdown & Notifikasi (JS)`, `Dependensi Runtime`, `package.json & DevDependencies`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Logika Game: XP, Streak, Quest, Penalti` be split into smaller, more focused modules?**
  _Cohesion score 0.06415396952686447 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Dependensi Runtime` to `package.json & DevDependencies`, `Dependensi: expo`, `Dependensi: expo-constants`, `Dependensi: expo-file-system`, `Dependensi: expo-font`, `Dependensi: @expo-google-fonts/chivo`, `Dependensi: @expo-google-fonts/jetbrains-mono`, `Dependensi: @expo-google-fonts/manrope`, `Dependensi: expo-haptics`, `Dependensi: expo-image`, `Dependensi: expo-image-picker`, `Dependensi: expo-keep-awake`, `Dependensi: expo-linear-gradient`, `Dependensi: expo-linking`, `Dependensi: expo-splash-screen`, `Dependensi: expo-status-bar`, `Dependensi: expo-system-ui`, `Dependensi: @expo/vector-icons`, `Dependensi: @react-native-async-storage/async-storage`, `Dependensi: react-native-gesture-handler`, `Dependensi: react-native-safe-area-context`, `Dependensi: react-native-screens`, `Dependensi: react-native-web`, `Dependensi: react-native-worklets`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `Mesin Animasi Gerakan` be split into smaller, more focused modules?**
  _Cohesion score 0.06253652834599649 - nodes in this community are weakly interconnected._