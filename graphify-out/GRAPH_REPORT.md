# Graph Report - fittyfit  (2026-11-19)

## Corpus Check
- 49 files · ~41,428 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .xml 3, (none) 1)

## Summary
- 577 nodes · 1919 edges · 34 communities (20 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d37e8883`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Layar Aplikasi & Sesi Latihan
- logic.ts
- Mesin Animasi Gerakan
- Lockdown & Notifikasi (JS)
- store.tsx
- Modul Native Lockdown (Kotlin)
- UI Kit, Tema & Navigasi Tab
- Konfigurasi app.json
- Render GIF Gerakan (Python)
- dependencies
- package.json
- Skrip npm
- Generator Ikon Aplikasi
- Konfigurasi TypeScript
- Paket modul shadow-lock
- program8.ts
- Dependensi: expo-constants
- components/penalty.tsx
- Dependensi: expo-font
- dayKey
- Dependensi: @expo-google-fonts/jetbrains-mono
- Dependensi: @expo-google-fonts/manrope
- app/_layout.tsx
- plan.ts
- expo-notifications
- Dependensi: expo-keep-awake
- react-dom@19.3.0
- react-native-keyboard-controller
- react-native-reanimated@4.7.1
- Dependensi: @react-native-async-storage/async-storage
- Dependensi: react-native-safe-area-context
- Dependensi: react-native-screens
- Dependensi: react-native-web

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 45 edges
2. `dayKey()` - 45 edges
3. `useStore()` - 44 edges
4. `StatusScreen()` - 36 edges
5. `Body` - 36 edges
6. `Label` - 33 edges
7. `Card()` - 31 edges
8. `Button()` - 31 edges
9. `Mono` - 29 edges
10. `Screen()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `SystemScreen()` --calls--> `isServiceEnabled()`  [EXTRACTED]
  src/app/(tabs)/system.tsx → modules/shadow-lock/index.ts
- `SystemScreen()` --calls--> `startLockTest()`  [EXTRACTED]
  src/app/(tabs)/system.tsx → modules/shadow-lock/index.ts
- `Daemon()` --calls--> `setLockConfig()`  [EXTRACTED]
  src/app/_layout.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `stopLockTest()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts
- `LockScreen()` --calls--> `nativeLockedNow()`  [EXTRACTED]
  src/app/lock.tsx → modules/shadow-lock/index.ts

## Import Cycles
- None detected.

## Communities (34 total, 14 thin omitted)

### Community 0 - "Layar Aplikasi & Sesi Latihan"
Cohesion: 0.11
Nodes (88): GrowthScreen(), persistPhoto(), styles, Onboarding(), PenaltyScreen(), PlankTimer(), styles, ProgramScreen() (+80 more)

### Community 1 - "logic.ts"
Cohesion: 0.08
Nodes (27): applyWeek(), ATTR_LABEL, attributes(), attrPoints(), ATTRS, CrystalDef, CRYSTALS, e1rm() (+19 more)

### Community 2 - "Mesin Animasi Gerakan"
Cohesion: 0.06
Nodes (51): add(), angleOf(), COLORS, CONTACT, cycleLength(), DEF, dir(), dumbbell() (+43 more)

### Community 3 - "Lockdown & Notifikasi (JS)"
Cohesion: 0.11
Nodes (20): AllowedApp, isServiceEnabled(), lockSupported, Native, nativeLockedNow(), openAccessibilitySettings(), openAllowedApp(), openAppDetails() (+12 more)

### Community 4 - "store.tsx"
Cohesion: 0.10
Nodes (23): QUESTS, TitleDef, Ctx, StoreContext, Updater, AppState, ExerciseGuide, ExerciseTemplate (+15 more)

### Community 5 - "Modul Native Lockdown (Kotlin)"
Cohesion: 0.07
Nodes (4): AllowList, LockPolicy, ShadowLockModule, ShadowLockService

### Community 6 - "UI Kit, Tema & Navigasi Tab"
Cohesion: 0.10
Nodes (36): expo-router, react, react-native, react-native-svg, styles, ask(), styles, ATTR_ICON (+28 more)

### Community 7 - "Konfigurasi app.json"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+21 more)

### Community 8 - "Render GIF Gerakan (Python)"
Cohesion: 0.27
Nodes (6): draw_frame(), font(), hex_rgb(), main(), mix(), slug()

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, expo@~58.0.25, expo-blur@~58.0.6, expo-file-system@~58.0.13, expo-image@~58.0.18, expo-image-picker@~58.0.10, expo-linear-gradient@~58.0.4, expo-router@~58.0.31 (+15 more)

### Community 10 - "package.json"
Cohesion: 0.10
Nodes (21): @expo-google-fonts/chivo@^0.4.2, expo-haptics@~58.0.8, expo-linking@~58.0.17, expo-status-bar@~58.0.5, react-native-gesture-handler@~3.3.0, react-native-worklets@0.13.0, devDependencies, @types/react@~19.3.0 (+13 more)

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

### Community 15 - "program8.ts"
Cohesion: 0.15
Nodes (20): display, out, tempoOf, initialState(), newProgramInfo(), uid(), computeSessionXp(), DROP() (+12 more)

### Community 17 - "components/penalty.tsx"
Cohesion: 0.16
Nodes (19): confirmBox(), RestPassControl(), styles, parseDay(), DEBUFF_FACTOR, DEBUFF_SESSIONS, focusOf(), isTrainingDay() (+11 more)

### Community 19 - "dayKey"
Cohesion: 0.23
Nodes (19): addDays(), dayKey(), pad(), weekKey(), weekStart(), EMERGENCY_PHRASE, EMERGENCY_WAIT_SEC, lockActiveNow() (+11 more)

### Community 22 - "app/_layout.tsx"
Cohesion: 0.22
Nodes (15): setLockConfig(), Daemon(), Gate(), RootLayout(), theme, cancelRestDone(), configureNotifications(), ensurePermission() (+7 more)

### Community 23 - "plan.ts"
Cohesion: 0.30
Nodes (13): at(), Planned, planNotifications(), hasSchedule(), isoDay(), isScheduledRest(), programWeek(), questStatus() (+5 more)

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 162 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Kit, Tema & Navigasi Tab` to `Layar Aplikasi & Sesi Latihan`, `Lockdown & Notifikasi (JS)`, `store.tsx`, `dependencies`, `package.json`, `components/penalty.tsx`, `app/_layout.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `Layar Aplikasi & Sesi Latihan` be split into smaller, more focused modules?**
  _Cohesion score 0.11004346831388698 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `UI Kit, Tema & Navigasi Tab` to `Layar Aplikasi & Sesi Latihan`, `Lockdown & Notifikasi (JS)`, `dependencies`, `package.json`, `components/penalty.tsx`, `app/_layout.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `logic.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07816091954022988 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `Dependensi: @react-native-async-storage/async-storage`, `Dependensi: react-native-safe-area-context`, `Dependensi: react-native-screens`, `Dependensi: react-native-web`, `package.json`, `Dependensi: expo-constants`, `Dependensi: expo-font`, `Dependensi: @expo-google-fonts/jetbrains-mono`, `Dependensi: @expo-google-fonts/manrope`, `expo-notifications`, `Dependensi: expo-keep-awake`, `react-dom@19.3.0`, `react-native-keyboard-controller`, `react-native-reanimated@4.7.1`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `Mesin Animasi Gerakan` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._