# PlayBox — Synthesis Document

**Project:** PlayBox — Web-Based Game Station Platform  
**Date:** 2026-05-28  
**Status:** Synthesis of Sub-Agent Research  
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Key Decisions & Justifications](#2-key-decisions--justifications)
3. [Consolidated Recommendations](#3-consolidated-recommendations)
4. [Conflicts & Trade-offs](#4-conflicts--trade-offs)
5. [High-Level Technical Approach](#5-high-level-technical-approach)

---

## 1. Executive Summary

PlayBox is a web-based game station platform hosting 55 casual games across 8 categories, built with React + Vite + TypeScript and a tiered game engine strategy (Plain Canvas, Kaboom.js, Phaser 3). The platform deploys to GitHub Pages for web access, builds Windows installers via Tauri v2, and Android APKs via Capacitor — all automated through GitHub Actions on every push to main. The design philosophy is minimal, joyful, and kid-friendly, with light/bright candy-inspired colors and playful interactions. Development follows an AI-agent-driven approach, targeting a 3-game MVP prototype first, then scaling to all 55 games for v1.0.0.

The project is ambitious in scope (55 games, 3 platforms, full CI/CD) but achievable because of the standardized game interface contract that decouples the platform shell from individual game implementations, the tiered engine approach that matches complexity to capability, and the single flat repo with automated registry generation that makes adding games a zero-configuration process.

---

## 2. Key Decisions & Justifications

### 2.1 Technology Stack

| Decision | Choice | Justification |
|---|---|---|
| Platform Shell | React + Vite | Best ecosystem for component-based UI, lazy loading, and PWA support. Vite provides instant HMR and optimized builds. |
| Game Engines | Tiered: Canvas / Kaboom.js / Phaser 3 | Canvas for 28 logic games (zero overhead), Kaboom for 16 arcade games (~40KB), Phaser for 11 sprite-heavy games (~350KB). Users only download engines they use. |
| Windows Build | Tauri v2 | 3–8 MB vs Electron's 150–250 MB. Uses system WebView2. Critical for GitHub Releases where users download directly. |
| Android Build | Capacitor | Most mature CI/CD pipeline for Android WebView wrappers. Generates signed APK. Tauri v2 mobile CI is still early. |
| CSS | Tailwind CSS | Utility-first for rapid development, excellent for kid-friendly design tokens, dark mode support built-in. |
| Language | TypeScript | Strict typing catches bugs at compile time. Essential for the game interface contract that 55 games must implement. |
| PWA | vite-plugin-pwa + Workbox | Offline support essential for Android/desktop apps. Cache-on-play strategy minimizes initial load. |
| Search | Fuse.js | Best fuzzy matching for kid-friendly misspellings. Only ~5KB. Overkill for 55 items but future-proof. |
| Score Storage | IndexedDB via Dexie.js | Handles 1,650+ score records with compound indexes. Async API doesn't block the main thread. |

### 2.2 Architecture Decisions

| Decision | Choice | Justification |
|---|---|---|
| Repo Structure | Single flat repo (no workspaces) | Simpler than monorepo tooling. Games are just directories under `src/games/`. Vite handles code splitting. |
| Game Registration | Auto-generated registry (`scripts/generate-game-registry.ts`) | Adding a game = creating a directory + implementing the interface. No manual config. |
| Game Interface | `PlayBoxGame` contract (mount/unmount/pause/resume + metadata) | Decouples shell from engines. Each game is a black box that the shell controls through a minimal API. |
| Code Splitting | Vite dynamic imports + `manualChunks` for engines | Engine chunks shared across games. Users only download engines for games they play. |
| Versioning | 0.minor.patch → 1.0.0 | Minor = new game/feature, Patch = bug fix. Conventional commits drive auto-versioning in CI. |

---

## 3. Consolidated Recommendations

### 3.1 From the Architect

- **Flat repo structure** with `src/games/<id>/` convention, `src-tauri/` for Windows, `android/` for Android
- **Auto-generated game registry** scanned at build time — zero-config game addition
- **Platform abstraction layer** (`src/lib/platform.ts`) for feature detection across web/Tauri/Capacitor
- **Hybrid PWA caching**: precache shell + cache-on-play for game assets
- **Top 5 risks**: Phaser bundle size, Kaboom global state, PWA cache invalidation, Android WebView performance, contributor onboarding

### 3.2 From the Game Engine Specialist

- **`PlayBoxGame` interface** with `mount(container, options)`, `unmount()`, optional `pause()`/`resume()`, and static `metadata`
- **Canvas games**: Use `ResizeObserver` + `devicePixelRatio` for responsive HiDPI rendering. Cancel `requestAnimationFrame` on unmount.
- **Kaboom games**: Pass `{ canvas, global: false }` for isolation. Navigate to empty cleanup scene on unmount. No built-in `destroy()` — null the context.
- **Phaser games**: Use `parent` config + `Scale.RESIZE` mode. Call `game.destroy(true)` on unmount. Wait for `READY` event before interacting.
- **Shared utilities**: SoundManager (Web Audio API), InputHelper, ScoreTracker, GameTimer, DifficultyHelper — injected via `MountOptions.utilities`
- **Memory management**: Checklist for unmount — cancel RAFs, destroy engine instances, remove listeners, clear container innerHTML

### 3.3 From the CI/CD Specialist

- **Single unified `ci.yml`** workflow with fan-out/fan-in architecture: determine-version → test → (deploy-pages, build-windows, build-android) → release
- **Version determination** from conventional commits: `feat:` = minor bump, `fix:` = patch bump
- **GitHub Pages**: Use Actions as build source, `actions/deploy-pages@v4`, OIDC permissions
- **Tauri Windows build**: `tauri-apps/tauri-action@v0` on `windows-latest`, Rust caching, NSIS + MSI installers
- **Capacitor Android build**: Gradle on `ubuntu-latest`, Java 17, debug APK by default (signed with secrets when available)
- **Release aggregation**: All artifacts collected in final `release` job, published with auto-generated categorized release notes
- **Caching**: Node `cache: npm`, Rust `swatinem/rust-cache@v2`, Gradle `cache: gradle` — reduces CI from ~15min to ~6min warm

### 3.4 From the UI/UX Designer

- **Color palette**: Candy/playground-inspired — Sunshine Yellow (#FFB830) primary, Candy Blue (#4DA8DA) secondary, 5 accent colors
- **Typography**: Nunito (headings) + Quicksand (body) — rounded terminals, kid-friendly but highly legible
- **13 React components**: GameCard, CategoryFilter, SearchBar, FavoritesToggle, SoundToggle, FullscreenButton, DifficultySelector, ThemeToggle, GameFrame, Header, Sidebar, MobileBottomNav, EmptyState
- **Layout**: Sidebar + content on desktop, bottom nav + scrollable feed on mobile. "Load More" pagination (not infinite scroll — better for kids)
- **Micro-animations**: Card hover lift, category pill select, heart bounce with particles, loading shimmer, confetti on high score
- **Accessibility**: 44px minimum touch targets, WCAG AA contrast, 2nd–3rd grade reading level, COPPA compliance (no data collection)
- **Dark mode**: Cozy deep navy (#1A1B2E), not black. Still fun — uses glow effects and dimmed thumbnails
- **PWA manifest**: Maskable icons, custom install prompt, splash screen with Sunshine Yellow branding

### 3.5 From the Game Catalog Specialist

- **55 games** across 8 categories: Logic/Puzzle (12), Arcade (10), Board (8), Card (5), Strategy (4), Action (5), Sports (3), Casual (5), Bonus/Seasonal (3)
- **Engine distribution**: Canvas 51%, Kaboom 29%, Phaser 20%
- **MVP**: Sudoku (Canvas) + Snake (Kaboom) + Breakout (Kaboom) — validates 2 engines, 2 categories, all features
- **Search**: Fuse.js with weighted multi-field search, 150ms debounce, recent searches (localStorage, max 5)
- **High scores**: IndexedDB via Dexie.js, compound index `[gameId+difficulty]`, top 10 per game per difficulty, export/import
- **Favorites**: localStorage, max 20, toggle from game card and in-game toolbar, horizontal scroll "My List" section
- **Difficulty**: Per-game, per-session. Each game defines what changes. Last-used difficulty persisted per game.
- **Sound**: Centralized SoundManager (Web Audio API), 3 categories (ui/game/music), global + per-game + per-category mute
- **Game loading**: 7-phase sequence (card expand → loading → asset preload → engine init → ready screen → countdown → play), ≤5s click-to-play target

---

## 4. Conflicts & Trade-offs

### 4.1 Game Interface: Two Slightly Different Definitions

**Conflict:** The Architect report defines `GameInterface` with `mount()` returning `Promise<GameInstance>`, while the Engine Specialist defines `PlayBoxGame` with `mount()` returning `void`. The Architect separates `GameCallbacks` as a parameter; the Specialist embeds callbacks in `MountOptions`.

**Resolution:** Use the Engine Specialist's `PlayBoxGame` interface as the canonical definition. It's more practical: `mount()` returns `void` (simpler for games), callbacks are embedded in `MountOptions` (fewer parameters), and the `GameUtilities` injection pattern is cleaner. The `GameInstance` concept is useful but should be managed internally by the `GameWrapper` component rather than exposed as a return type.

### 4.2 Kaboom.js Cleanup: No Official Destroy Method

**Conflict:** Kaboom.js lacks a proper `destroy()` method, creating a risk of memory leaks when switching games.

**Resolution:** Use the workaround: navigate to an empty cleanup scene (`k.go('___cleanup___')`), then null the Kaboom context. Additionally, the `GameWrapper` component will forcibly clear `container.innerHTML` on unmount as a safety net. This is an accepted trade-off — Kaboom's simplicity and small size outweigh this cleanup limitation.

### 4.3 Phaser Bundle Size vs. Game Quality

**Conflict:** Phaser 3 is ~350KB gzipped, which is significant for mobile users. However, 11 games require Phaser's capabilities (physics, sprite management, particles).

**Resolution:** Accept the trade-off. Phaser is loaded as a shared chunk — once loaded for one Phaser game, it's cached for all subsequent Phaser games. With the cache-on-play PWA strategy, Phaser is only downloaded when a user first plays a Phaser game. The 20% of games that need Phaser justify the cost. We mitigate further by ensuring the initial shell load never includes Phaser.

### 4.4 Flat Repo vs. Monorepo for 55 Games

**Conflict:** The Architect and CI/CD reports both recommend a flat repo, but as the number of games grows, build times may increase since Vite must analyze all game modules even if only a few changed.

**Resolution:** Stay with flat repo for simplicity, but add a CI optimization: use `dorny/paths-filter` to detect which games changed and only run relevant tests. Vite's code splitting already handles per-game chunks. If build times become problematic at 55+ games, we can add Turborepo later without restructuring.

### 4.5 CI/CD: Every Push vs. Tagged Releases

**Conflict:** The user wants releases on every push to main. The CI/CD report notes this could create many pre-release versions (all 0.x) that clutter the Releases page.

**Resolution:** Mark all 0.x releases as `prerelease: true` in GitHub. The Releases page shows "Latest" (non-prerelease) separately, so casual users won't see development builds. Power users and testers can opt into pre-releases. At v1.0.0, the release becomes the first "Latest."

### 4.6 Android: Debug APK vs. Signed APK

**Conflict:** Signed APKs require keystore secrets that may not be set up initially. Debug APKs work but show a "debug" badge and can't be published to Play Store.

**Resolution:** CI builds debug APK by default. When signing secrets are configured (`ANDROID_SIGNING_KEY_BASE64`, etc.), it automatically switches to signed release APK. This allows development to proceed immediately while leaving the door open for production signing.

---

## 5. High-Level Technical Approach

### 5.1 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      PlayBox Application                      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  React Platform Shell                      │ │
│  │  (React Router + ThemeProvider + SoundProvider + PWA)      │ │
│  │                                                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │
│  │  │ HomePage │  │ GamePage │  │  FavsPage│  │SettingsPg│ │ │
│  │  │ (catalog)│  │(play)    │  │          │  │          │ │ │
│  │  └──────────┘  └────┬─────┘  └──────────┘  └──────────┘ │ │
│  │                     │                                      │ │
│  │              GameWrapper (bridge)                           │ │
│  │                     │                                      │ │
│  │        ┌────────────┼────────────┐                         │ │
│  │        ▼            ▼            ▼                         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │ │
│  │  │ Canvas   │ │ Kaboom   │ │ Phaser   │                   │ │
│  │  │ Games(28)│ │ Games(16)│ │ Games(11)│                   │ │
│  │  └──────────┘ └──────────┘ └──────────┘                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │ Shared Services  │  │ Platform Layer  │                     │
│  │ (Sound, Score,   │  │ (Web/Tauri/     │                     │
│  │  Search, Favs)   │  │  Capacitor)     │                     │
│  └─────────────────┘  └─────────────────┘                     │
└──────────────────────────────────────────────────────────────┘

Deploy Targets:
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ GitHub Pages │  │ Tauri v2     │  │ Capacitor    │
  │ (Web/PWA)    │  │ (Windows)    │  │ (Android)    │
  └──────────────┘  └──────────────┘  └──────────────┘
```

### 5.2 Data Flow: Playing a Game

```
1. User browses catalog (HomePage reads gameMetas — no engine code loaded)
2. User clicks "Snake" game card
3. React Router navigates to /game/snake
4. GamePage dynamically imports games/snake/index.ts
5. Vite loads: snake chunk + engine-kaboom chunk (shared)
6. GameWrapper mounts: creates container div, calls snake.mount(container, options)
7. Snake initializes Kaboom context with canvas, starts game scene
8. User plays — score updates flow through onScoreUpdate callback → ScoreTracker → IndexedDB
9. User navigates back → GameWrapper calls snake.unmount() → Kaboom cleaned up → container cleared
```

### 5.3 Build & Deploy Pipeline

```
Push to main
    │
    ├─ determine-version (conventional commits → 0.minor.patch)
    │
    ├─ test (lint, type-check, unit tests, build smoke test)
    │
    ├─── deploy-pages (Vite build → GitHub Pages)
    │
    ├─── build-windows (Tauri build → .exe + .msi)
    │
    ├─── build-android (Capacitor build → .apk)
    │
    └─── release (aggregate artifacts → GitHub Release v0.X.Y)
```

### 5.4 Key Implementation Priorities

1. **Establish the `PlayBoxGame` interface first** — every game depends on this contract
2. **Build the platform shell with 1 game** — validate the full pipeline (mount → play → score → unmount)
3. **Set up CI/CD early** — automated deploys and builds from day one
4. **Implement shared services** (Sound, Score, Search, Favorites) — used by all games
5. **Add games in waves** — start with MVP 3, then add by complexity (Easy → Medium → Hard)
6. **Cross-platform testing** — test on Windows/Android after every major milestone

### 5.5 Success Metrics

- **Phase 0 (MVP)**: 3 playable games on web + auto-deploy to GitHub Pages
- **Phase 1**: 15+ games, Windows + Android builds, PWA offline, all platform features
- **Phase 2**: 30+ games, polish, performance optimization, accessibility audit
- **Phase 3 (v1.0.0)**: All 55 games, production-signed builds, v1.0.0 release
