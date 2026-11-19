# Graph Report - fittyfit  (2026-11-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 596 nodes · 1999 edges · 37 communities (16 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f123a113`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Kit, Tema & Navigasi Tab
- Penalty Quest & Rest Pass
- Mesin Animasi Gerakan
- UI Kit, Tema & Navigasi Tab (2)
- Model Data & State Store
- Modul Native Lockdown (Kotlin)
- Dependensi: expo-blur
- Konfigurasi app.json
- Render GIF Gerakan (Python)
- Dependensi Runtime
- package.json & Dependensi Lain
- Skrip npm
- Generator Ikon Aplikasi
- Konfigurasi TypeScript
- Paket modul shadow-lock
- Logika Game: XP, Atribut, Quest & Gelar
- Lockdown & Notifikasi (JS) (2)
- Dependensi: expo-file-system
- Dependensi: expo-constants
- Dependensi: react-native-gesture-handler
- Dependensi: @expo-google-fonts/chivo
- Dependensi: @expo-google-fonts/manrope
- Lockdown & Notifikasi (JS)
- Dependensi: @expo-google-fonts/jetbrains-mono
- Dependensi: expo-haptics
- Dependensi: expo-image
- Dependensi: expo-image-picker
- Dependensi: expo-keep-awake
- Dependensi: expo-linear-gradient
- Dependensi: expo-linking
- Dependensi: expo-notifications
- Dependensi: expo-status-bar
- Dependensi: expo-system-ui
- Dependensi: @react-native-async-storage/async-storage
- Dependensi: react-native-safe-area-context
- Dependensi: react-native-web

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 47 edges
2. `useStore()` - 46 edges
3. `dayKey()` - 45 edges
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
- `SystemScreen()` --calls--> `isServiceEnabled()`  [EXTRACTED]
  src/app/(tabs)/system.tsx → modules/shadow-lock/index.ts
- `Daemon()` --calls--> `setLockConfig()`  [EXTRACTED]
  src/app/_layout.tsx → modules/shadow-lock/index.ts

## Import Cycles
- None detected.

## Communities (37 total, 21 thin omitted)

### Community 0 - "UI Kit, Tema & Navigasi Tab"
Cohesion: 0.10
Nodes (93): GrowthScreen(), LockScreen(), PenaltyScreen(), PlankTimer(), styles, ask(), ProgramScreen(), styles (+85 more)

### Community 1 - "Penalty Quest & Rest Pass"
Cohesion: 0.10
Nodes (45): APPS, styles, at(), Planned, planNotifications(), PREFIX, addDays(), dayKey() (+37 more)

### Community 2 - "Mesin Animasi Gerakan"
Cohesion: 0.06
Nodes (54): display, out, tempoOf, add(), angleOf(), COLORS, CONTACT, cycleLength() (+46 more)

### Community 3 - "UI Kit, Tema & Navigasi Tab (2)"
Cohesion: 0.13
Nodes (29): expo-router, react, react-native, react-native-svg, persistPhoto(), styles, Onboarding(), styles (+21 more)

### Community 4 - "Model Data & State Store"
Cohesion: 0.08
Nodes (42): initialState(), newProgramInfo(), uid(), computeSessionXp(), TitleDef, DROP(), DUMBBELL_KG, ex() (+34 more)

### Community 5 - "Modul Native Lockdown (Kotlin)"
Cohesion: 0.07
Nodes (4): AllowList, LockPolicy, ShadowLockModule, ShadowLockService

### Community 7 - "Konfigurasi app.json"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+21 more)

### Community 8 - "Render GIF Gerakan (Python)"
Cohesion: 0.18
Nodes (10): candidates(), main(), name_for(), rel(), draw_frame(), font(), hex_rgb(), main() (+2 more)

### Community 9 - "Dependensi Runtime"
Cohesion: 0.13
Nodes (15): dependencies, expo@~58.0.25, expo-font@~58.0.12, expo-router@~58.0.31, react@19.3.0, react-dom@19.3.0, react-native@0.88.1, react-native-keyboard-controller@^1.22.7 (+7 more)

### Community 10 - "package.json & Dependensi Lain"
Cohesion: 0.12
Nodes (17): expo-splash-screen@~58.0.14, @expo/vector-icons@^15.1.1, react-native-reanimated@4.7.1, react-native-worklets@0.13.0, devDependencies, @types/react@~19.3.0, typescript@~6.0.3, main (+9 more)

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
Nodes (45): HallScreen(), styles, fmtPts(), styles, ATTR_ICON, ATTR_INFO, AttrInfo, crystalsForAttr() (+37 more)

### Community 22 - "Lockdown & Notifikasi (JS)"
Cohesion: 0.12
Nodes (30): AllowedApp, isServiceEnabled(), lockSupported, Native, nativeLockedNow(), openAccessibilitySettings(), openAllowedApp(), openAppDetails() (+22 more)

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 165 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Kit, Tema & Navigasi Tab (2)` to `UI Kit, Tema & Navigasi Tab`, `Penalty Quest & Rest Pass`, `Model Data & State Store`, `Dependensi Runtime`, `package.json & Dependensi Lain`, `Logika Game: XP, Atribut, Quest & Gelar`, `Lockdown & Notifikasi (JS)`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `UI Kit, Tema & Navigasi Tab` be split into smaller, more focused modules?**
  _Cohesion score 0.10297029702970296 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `UI Kit, Tema & Navigasi Tab (2)` to `UI Kit, Tema & Navigasi Tab`, `Penalty Quest & Rest Pass`, `Dependensi Runtime`, `package.json & Dependensi Lain`, `Logika Game: XP, Atribut, Quest & Gelar`, `Lockdown & Notifikasi (JS)`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Penalty Quest & Rest Pass` be split into smaller, more focused modules?**
  _Cohesion score 0.10448979591836735 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Skrip npm` to `package.json & Dependensi Lain`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Mesin Animasi Gerakan` be split into smaller, more focused modules?**
  _Cohesion score 0.06253652834599649 - nodes in this community are weakly interconnected._