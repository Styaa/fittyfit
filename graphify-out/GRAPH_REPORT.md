# Graph Report - fittyfit  (2026-11-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 652 nodes · 2209 edges · 26 communities (16 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b2aacbd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Kit, Tema & Navigasi Tab
- Dependensi: @expo/vector-icons
- Mesin Animasi Gerakan
- Kode: tracker.ts
- Model Data & State Store
- Modul Native Lockdown (Kotlin)
- Root Layout, Daemon & Notifikasi
- Konfigurasi app.json
- Render GIF Gerakan (Python)
- Dependensi Runtime
- Dependensi: devDependencies
- Skrip npm
- Generator Ikon Aplikasi
- Konfigurasi TypeScript
- Paket modul shadow-lock
- Logika Game: XP, Atribut, Quest & Gelar
- Dependensi: react-native-gesture-handler
- Dependensi: react-native-safe-area-context
- Dependensi: react-native-web
- Dependensi: @expo-google-fonts/manrope
- Lockdown & Notifikasi (JS)
- Dependensi: expo-font
- Dependensi: react-native-keyboard-controller
- Dependensi: expo-notifications
- Dependensi: expo-status-bar

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 52 edges
2. `useStore()` - 51 edges
3. `dayKey()` - 48 edges
4. `Body` - 40 edges
5. `Label` - 38 edges
6. `StatusScreen()` - 37 edges
7. `Button()` - 33 edges
8. `Card()` - 33 edges
9. `Mono` - 33 edges
10. `Screen()` - 30 edges

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

## Communities (26 total, 10 thin omitted)

### Community 0 - "UI Kit, Tema & Navigasi Tab"
Cohesion: 0.09
Nodes (114): react@19.3.0, react-native@0.88.1, react-native-svg@^15.16.0, expo-router, react, react-native, react-native-svg, GrowthScreen() (+106 more)

### Community 2 - "Mesin Animasi Gerakan"
Cohesion: 0.06
Nodes (56): display, out, tempoOf, add(), angleOf(), COLORS, CONTACT, cycleLength() (+48 more)

### Community 3 - "Kode: tracker.ts"
Cohesion: 0.10
Nodes (37): expo-haptics, confirmBox(), START_ERRORS, Stat(), styles, WalkScreen(), styles, WalkBanner() (+29 more)

### Community 4 - "Model Data & State Store"
Cohesion: 0.06
Nodes (54): blank(), fmtPts(), styles, ATTR_ICON, ATTR_INFO, AttrInfo, crystalsForAttr(), exercisesForAttr() (+46 more)

### Community 5 - "Modul Native Lockdown (Kotlin)"
Cohesion: 0.07
Nodes (4): AllowList, LockPolicy, ShadowLockModule, ShadowLockService

### Community 6 - "Root Layout, Daemon & Notifikasi"
Cohesion: 0.22
Nodes (15): setLockConfig(), Daemon(), Gate(), RootLayout(), theme, RestBanner(), cancelRestDone(), configureNotifications() (+7 more)

### Community 7 - "Konfigurasi app.json"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+21 more)

### Community 8 - "Render GIF Gerakan (Python)"
Cohesion: 0.18
Nodes (10): candidates(), main(), name_for(), rel(), draw_frame(), font(), hex_rgb(), main() (+2 more)

### Community 9 - "Dependensi Runtime"
Cohesion: 0.06
Nodes (47): dependencies, expo@~58.0.25, expo-blur@~58.0.6, expo-constants@~58.0.16, expo-file-system@~58.0.13, @expo-google-fonts/chivo@^0.4.2, @expo-google-fonts/jetbrains-mono@^0.4.1, expo-haptics@~58.0.8 (+39 more)

### Community 10 - "Dependensi: devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @types/react@~19.3.0, typescript@~6.0.3, @types/react, typescript

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
Cohesion: 0.05
Nodes (87): confirmBox(), RestPassControl(), styles, at(), Planned, planNotifications(), addDays(), dayKey() (+79 more)

### Community 22 - "Lockdown & Notifikasi (JS)"
Cohesion: 0.10
Nodes (22): AllowedApp, isServiceEnabled(), lockSupported, Native, nativeLockedNow(), openAccessibilitySettings(), openAllowedApp(), openAppDetails() (+14 more)

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 182 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `UI Kit, Tema & Navigasi Tab` to `Mesin Animasi Gerakan`, `Kode: tracker.ts`, `Model Data & State Store`, `Root Layout, Daemon & Notifikasi`, `Dependensi Runtime`, `Logika Game: XP, Atribut, Quest & Gelar`, `Lockdown & Notifikasi (JS)`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `UI Kit, Tema & Navigasi Tab` be split into smaller, more focused modules?**
  _Cohesion score 0.08608338226658838 - nodes in this community are weakly interconnected._
- **Why does `react` connect `UI Kit, Tema & Navigasi Tab` to `Mesin Animasi Gerakan`, `Kode: tracker.ts`, `Model Data & State Store`, `Root Layout, Daemon & Notifikasi`, `Dependensi Runtime`, `Logika Game: XP, Atribut, Quest & Gelar`, `Lockdown & Notifikasi (JS)`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Mesin Animasi Gerakan` be split into smaller, more focused modules?**
  _Cohesion score 0.06187202538339503 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Skrip npm` to `Dependensi Runtime`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Kode: tracker.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0971322849213691 - nodes in this community are weakly interconnected._