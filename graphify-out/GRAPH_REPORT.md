# Graph Report - fittyfit  (2026-11-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 658 nodes · 2253 edges · 37 communities (16 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b1e5a46`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Kit, Tema & Navigasi Tab
- Dependensi: @expo/vector-icons
- Mesin Animasi Gerakan
- Kode: tracker.ts
- Model Data & State Store
- Modul Native Lockdown (Kotlin)
- Info Atribut & Cara Menaikkan
- Konfigurasi app.json
- Render GIF Gerakan (Python)
- package.json & Dependensi Lain
- Dependensi: expo
- Skrip npm
- Generator Ikon Aplikasi
- Konfigurasi TypeScript
- Paket modul shadow-lock
- Logika Game: XP, Atribut, Quest & Gelar
- Dependensi: react-native-gesture-handler
- Dependensi: expo-blur
- Dependensi: expo-constants
- Dependensi: expo-file-system
- Dependensi: @expo-google-fonts/chivo
- Dependensi: @expo-google-fonts/manrope
- Lockdown & Notifikasi (JS)
- Dependensi: @expo-google-fonts/jetbrains-mono
- Dependensi: expo-image
- Dependensi: expo-keep-awake
- Dependensi: expo-linking
- Dependensi Runtime
- Dependensi: expo-location
- Dependensi: react-native-keyboard-controller
- Dependensi: expo-notifications
- Dependensi: expo-status-bar
- Dependensi: expo-splash-screen
- Dependensi: expo-task-manager
- Dependensi: react-dom
- Dependensi: react-native-reanimated

## God Nodes (most connected - your core abstractions)
1. `useStore()` - 53 edges
2. `Icon()` - 52 edges
3. `dayKey()` - 48 edges
4. `Body` - 40 edges
5. `Label` - 40 edges
6. `StatusScreen()` - 37 edges
7. `Button()` - 35 edges
8. `Card()` - 33 edges
9. `Mono` - 33 edges
10. `glow()` - 32 edges

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

## Communities (37 total, 21 thin omitted)

### Community 0 - "UI Kit, Tema & Navigasi Tab"
Cohesion: 0.09
Nodes (100): expo-router, GrowthScreen(), persistPhoto(), styles, Onboarding(), styles, PenaltyScreen(), PlankTimer() (+92 more)

### Community 2 - "Mesin Animasi Gerakan"
Cohesion: 0.06
Nodes (57): display, out, tempoOf, add(), angleOf(), COLORS, CONTACT, cycleLength() (+49 more)

### Community 3 - "Kode: tracker.ts"
Cohesion: 0.07
Nodes (50): expo-haptics, react-native-safe-area-context, Daemon(), Gate(), RootLayout(), theme, confirmBox(), START_ERRORS (+42 more)

### Community 4 - "Model Data & State Store"
Cohesion: 0.07
Nodes (47): initialState(), newProgramInfo(), uid(), computeSessionXp(), levelInfo(), TitleDef, totalXp(), xpForLevel() (+39 more)

### Community 5 - "Modul Native Lockdown (Kotlin)"
Cohesion: 0.07
Nodes (4): AllowList, LockPolicy, ShadowLockModule, ShadowLockService

### Community 6 - "Info Atribut & Cara Menaikkan"
Cohesion: 0.10
Nodes (31): react, react-native, react-native-svg, styles, TabBar(), TABS, TabsLayout(), fmtPts() (+23 more)

### Community 7 - "Konfigurasi app.json"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+21 more)

### Community 8 - "Render GIF Gerakan (Python)"
Cohesion: 0.18
Nodes (10): candidates(), main(), name_for(), rel(), draw_frame(), font(), hex_rgb(), main() (+2 more)

### Community 9 - "package.json & Dependensi Lain"
Cohesion: 0.12
Nodes (17): expo-linear-gradient@~58.0.4, @react-native-async-storage/async-storage@^2.2.0, react-native-screens@~4.30.1, react-native-web@~0.21.4, devDependencies, @types/react@~19.3.0, typescript@~6.0.3, main (+9 more)

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

### Community 15 - "Logika Game: XP, Atribut, Quest & Gelar"
Cohesion: 0.06
Nodes (86): APPS, LockScreen(), styles, StatusScreen(), styles, Radar(), confirmBox(), DebuffTag() (+78 more)

### Community 22 - "Lockdown & Notifikasi (JS)"
Cohesion: 0.11
Nodes (17): AllowedApp, isServiceEnabled(), lockSupported, Native, nativeLockedNow(), openAccessibilitySettings(), openAllowedApp(), openAppDetails() (+9 more)

### Community 27 - "Dependensi Runtime"
Cohesion: 0.13
Nodes (15): dependencies, expo-font@~58.0.12, expo-haptics@~58.0.8, expo-image-picker@~58.0.10, expo-router@~58.0.31, expo-system-ui@~58.0.7, react@19.3.0, react-native@0.88.1 (+7 more)

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 185 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `Info Atribut & Cara Menaikkan` to `UI Kit, Tema & Navigasi Tab`, `Mesin Animasi Gerakan`, `Kode: tracker.ts`, `package.json & Dependensi Lain`, `Logika Game: XP, Atribut, Quest & Gelar`, `Lockdown & Notifikasi (JS)`, `Dependensi Runtime`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `UI Kit, Tema & Navigasi Tab` be split into smaller, more focused modules?**
  _Cohesion score 0.09271089271089271 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Info Atribut & Cara Menaikkan` to `UI Kit, Tema & Navigasi Tab`, `Mesin Animasi Gerakan`, `Kode: tracker.ts`, `Model Data & State Store`, `package.json & Dependensi Lain`, `Logika Game: XP, Atribut, Quest & Gelar`, `Lockdown & Notifikasi (JS)`, `Dependensi Runtime`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `Mesin Animasi Gerakan` be split into smaller, more focused modules?**
  _Cohesion score 0.0629800307219662 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Skrip npm` to `package.json & Dependensi Lain`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Kode: tracker.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07322068612391193 - nodes in this community are weakly interconnected._