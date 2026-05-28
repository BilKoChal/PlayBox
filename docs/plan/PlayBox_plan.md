# PlayBox — Project Plan

**Project:** PlayBox — Web-Based Game Station Platform  
**Date:** 2026-05-28  
**Version:** 1.0  
**Status:** Planning Complete

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Phases & Sub-Phases](#4-phases--sub-phases)
5. [Dependencies & Critical Path](#5-dependencies--critical-path)
6. [Risk Assessment](#6-risk-assessment)
7. [Next Steps](#7-next-steps)

---

## 1. Project Overview

### Project Name
PlayBox

### Goal
Build a web-based game station platform hosting 55 casual games, deployable as a PWA (GitHub Pages), Windows desktop app (Tauri v2), and Android app (Capacitor), with automated CI/CD that builds and releases all platforms on every push to main.

### Target Audience
Children ages 4–12, families, and casual gamers. The platform must feel joyful, approachable, and fun — never intimidating or overwhelming.

### Main Features
- 55 casual games across 8 categories (Logic/Puzzle, Arcade, Board, Card, Strategy, Action, Sports, Casual)
- Game catalog with category filters, fuzzy search (Fuse.js), and favorites
- Local high scores with per-game leaderboards (IndexedDB/Dexie.js)
- Difficulty selection per game (Easy/Medium/Hard)
- Full PWA with offline support and service worker
- Windows desktop app (Tauri v2, ~3–8 MB)
- Android app (Capacitor, signed APK)
- Auto-deploy to GitHub Pages on push to main
- Auto-release Windows + Android builds to GitHub Releases on push to main
- Joyful, kid-friendly design with light theme (candy/playground palette)
- Dark mode support (cozy navy, not black)
- Sound management with global/per-game/per-category mute
- Fullscreen mode (web, Windows, Android)

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Platform Shell | React + Vite | React 19, Vite 6 |
| Language | TypeScript | 5.6+ |
| CSS | Tailwind CSS | 4.0 |
| Game Engines | Plain Canvas / Kaboom.js / Phaser 3 | Kaboom 3000+, Phaser 3.80+ |
| Windows Build | Tauri v2 | 2.0+ |
| Android Build | Capacitor | 6.0+ |
| PWA | vite-plugin-pwa + Workbox | 0.21+ |
| Search | Fuse.js | 7.0+ |
| Score Storage | IndexedDB via Dexie.js | 4.0+ |
| Package Manager | pnpm | 9.0+ |
| CI/CD | GitHub Actions | - |
| Code Quality | ESLint + Prettier | - |
| Testing | Vitest + Playwright | - |

---

## 3. Project Structure

```
playbox/
├── .github/
│   └── workflows/
│       └── ci.yml                         # Unified CI/CD pipeline
│
├── public/
│   ├── icons/                             # PWA icons (192, 512, maskable)
│   ├── games/                             # Static game assets (sprites, audio)
│   │   ├── snake/
│   │   ├── flappy-bird/
│   │   └── ...
│   ├── favicon.ico
│   ├── manifest.json                      # PWA manifest
│   └── robots.txt
│
├── src/
│   ├── main.tsx                           # Entry point
│   ├── App.tsx                            # Root with router + providers
│   │
│   ├── components/
│   │   ├── layout/                        # Header, Sidebar, Footer, GameGrid
│   │   ├── game/                          # GameWrapper, GameOverlay, GameCard
│   │   ├── ui/                            # Button, Modal, Toggle, SearchBar, Badge
│   │   └── feedback/                      # Toast, ScoreDisplay, EmptyState
│   │
│   ├── hooks/
│   │   ├── useGame.ts                     # Game lifecycle
│   │   ├── useHighScore.ts                # Score persistence
│   │   ├── useFavorites.ts                # Favorites management
│   │   ├── useSound.ts                    # Global sound toggle
│   │   ├── useFullscreen.ts               # Fullscreen API
│   │   ├── useTheme.ts                    # Light/dark theme
│   │   └── useSearch.ts                   # Fuzzy search with debounce
│   │
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   ├── SoundContext.tsx
│   │   └── GameContext.tsx
│   │
│   ├── pages/
│   │   ├── HomePage.tsx                   # Game catalog
│   │   ├── GamePage.tsx                   # Individual game play
│   │   ├── FavoritesPage.tsx              # Favorites collection
│   │   └── SettingsPage.tsx               # Global settings
│   │
│   ├── lib/
│   │   ├── storage.ts                     # IndexedDB + localStorage abstraction
│   │   ├── audio.ts                       # Web Audio API sound manager
│   │   ├── platform.ts                    # Platform detection (web/tauri/capacitor)
│   │   ├── search.ts                      # Fuse.js search engine
│   │   └── fullscreen.ts                  # Cross-platform fullscreen service
│   │
│   ├── types/
│   │   └── game.ts                        # PlayBoxGame interface, metadata, categories
│   │
│   ├── styles/
│   │   └── globals.css                    # Tailwind directives + custom properties
│   │
│   ├── games/                             # *** ALL GAMES LIVE HERE ***
│   │   ├── sudoku/
│   │   │   └── index.ts                   # Implements PlayBoxGame
│   │   ├── snake/
│   │   │   └── index.ts
│   │   ├── breakout/
│   │   │   └── index.ts
│   │   └── .../                           # 52+ more games
│   │
│   ├── game-registry.generated.ts         # Auto-generated: game ID → lazy import + metadata
│   └── game-registry.ts                   # Registry lookup helpers
│
├── src-tauri/                             # Tauri v2 (Windows)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   └── icons/
│
├── android/                               # Capacitor (Android)
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   ├── build.gradle
│   └── settings.gradle
│
├── scripts/
│   ├── generate-game-registry.ts          # Scans src/games/ → generates registry
│   ├── check-game-interface.ts            # Validates PlayBoxGame compliance
│   └── copy-404.js                        # SPA routing fix for GitHub Pages
│
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── capacitor.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .prettierrc
├── .eslintrc.cjs
└── README.md
```

---

## 4. Phases & Sub-Phases

### Phase 0 — Rapid Prototype (3 Games, Core Platform)

**Goal:** A demonstrable, runnable prototype with 3 games, basic UI, auto-deploy to GitHub Pages, and Windows/Android builds.

**After Phase 0, the user has:**
- Working game catalog with 3 playable games
- GitHub Pages deployment on push to main
- Windows .exe/.msi and Android .apk in GitHub Releases
- Complete game interface contract validated with 3 engines
- Basic PWA (installable, offline shell)

#### 0.1 — Project Scaffolding & Configuration ✅ COMPLETE (2026-05-28)
- [x] Initialize Git repo with `main` branch
- [x] Create Vite + React + TypeScript project
- [x] Configure Tailwind CSS with PlayBox design tokens (candy palette, Nunito/Quicksand fonts)
- [x] Configure ESLint + Prettier
- [x] Create project folder structure (src/components, src/hooks, src/games, etc.)
- [x] Configure `vite.config.ts` with code splitting (`manualChunks` for engines)
- [x] Create `src/types/game.ts` with canonical `PlayBoxGame` interface
- [x] Set up `src-tauri/` (Tauri v2 config, Cargo.toml)
- [x] Set up `android/` (Capacitor config, build.gradle)
- [x] Create `manifest.json` for PWA
- [x] Create `index.html` with font preconnects
- [x] Write `scripts/generate-game-registry.ts`
- [x] Write `scripts/copy-404.js` for SPA routing on GitHub Pages
- **Note:** Also created lib stubs (audio, storage, platform, fullscreen, search), contexts (Theme, Sound, Game), and game-registry helpers. Kaboom is deprecated — consider KAPLAY migration in Phase 1. See [worklog](worklogs/1%20-%20worklog.md).

#### 0.2 — Platform Shell (Basic UI) ✅ COMPLETE (2026-05-28)
- [x] Build `App.tsx` with React Router + ThemeProvider + SoundProvider
- [x] Build `Header` component (logo, search placeholder, sound/theme toggles)
- [x] Build `HomePage` with responsive game grid (grid-cols-1 to grid-cols-4)
- [x] Build `GameCard` component (thumbnail, title, category dot, difficulty stars, favorite heart)
- [x] Build `GameWrapper` component (the bridge between React and PlayBoxGame interface)
- [x] Build `GamePage` with lazy loading via dynamic imports
- [x] Implement basic `ThemeContext` (light/dark toggle with localStorage persistence)
- [x] Implement basic `SoundContext` (global mute toggle)
- [x] Implement basic routing: `/` (catalog), `/game/:gameId` (play)
- **Note:** Also built UI components (Button, Toggle, SearchBar, Badge, Modal), feedback components (Toast, ScoreDisplay, EmptyState), pages (Favorites, Settings), hooks (useFavorites, useFullscreen, useSearch), and Footer. Tauri API accessed via runtime `__TAURI_INTERNALS__` to prevent build errors. See [worklog](worklogs/2%20-%20worklog.md).

#### 0.3 — Shared Services (Core) ✅ COMPLETE (2026-05-28)
- [x] Implement `SoundManager` class (Web Audio API, 3 categories, global mute, lazy init)
- [x] Implement `ScoreTracker` with Dexie.js (IndexedDB, score submission, top-10 query)
- [x] Implement `FavoritesManager` (localStorage, max 20, toggle)
- [x] Implement `FullscreenService` (web Fullscreen API + Tauri + Capacitor abstraction)
- [x] Implement platform detection (`src/lib/platform.ts`)
- **Note:** Also created ScoreFormatter, PlayerNameManager, SettingsManager, procedural sound generation, online/offline and preference change event systems. See [worklog](worklogs/3%20-%20worklog.md).

#### 0.4 — MVP Games (3 Games) ✅ COMPLETE (2026-05-28)
- [x] **Sudoku** (Canvas, Logic/Puzzle) — Full implementation with 3 difficulties, scoring by time, AI solver for validation
- [x] **Snake** (Kaboom, Arcade) — Full implementation with 3 speeds, scoring by length, sound effects
- [x] **Breakout** (Kaboom, Arcade) — Full implementation with 3 difficulties, scoring, collision detection
- [x] Each game implements `PlayBoxGame` interface with metadata, mount, unmount, pause, resume
- [x] Generate thumbnails for each game (AI-generated via z-ai-generate)
- [x] Register all 3 in game registry
- **Note:** Sudoku uses different grid sizes per difficulty (4×4, 6×6, 9×9). Snake uses wall wrap on Easy for kid-friendliness. Breakout uses direct touch-to-paddle mapping. All games use procedural sounds only (no audio files). Kaboom games use `global: false` mode with cleanup via empty scene navigation. See [worklog](worklogs/4%20-%20worklog.md).

#### 0.5 — CI/CD Pipeline ✅ COMPLETE (2026-05-28)
- [x] Create `.github/workflows/ci.yml` with 5 jobs:
  1. `test` — Lint, type-check, build smoke test (runs on PR + push)
  2. `deploy-pages` — Build Vite → deploy to GitHub Pages via Actions (push to main only)
  3. `build-windows` — Tauri v2 build → .exe + .msi artifacts (push to main only)
  4. `build-android` — Capacitor build → .apk artifact (push to main only)
  5. `release` — Aggregate all artifacts → GitHub Release (push to main only)
- [x] Configure GitHub Pages source as "GitHub Actions" (documented, user must set)
- [x] Fix `scripts/copy-404.js` for ESM compatibility (require → import)
- [x] Build verified locally: tsc 0 errors, vite build 83 modules in 4.55s
- **Note:** User must configure GitHub repo settings before first push: (1) Pages → Source = "GitHub Actions", (2) Actions → Workflow permissions = "Read and write". No secrets required for MVP. See [task plan](tasks/5%20-%20CI_CD%20Pipeline.md).

#### 0.6 — PWA & Offline
- Configure `vite-plugin-pwa` with Workbox
- Set up precache for shell (HTML, CSS, JS bundles)
- Set up cache-on-play for game assets and engine chunks
- Create offline fallback page
- Test install prompt and offline functionality

**Phase 0 Milestone:** PlayBox is live at `https://owner.github.io/playbox/` with 3 games, installable as PWA, with Windows and Android builds available in GitHub Releases.

---

### Phase 1 — Feature Complete Platform (15+ Games)

**Goal:** Expand to 15+ games, implement all platform features (search, filters, scores, favorites, difficulty), polish the UI, and validate cross-platform behavior.

**After Phase 1, the user has:**
- 15+ playable games across multiple categories and all 3 engine tiers
- Full search with fuzzy matching and autocomplete
- Category filters with URL-based sharing
- High score leaderboards per game per difficulty
- Favorites system with horizontal "My List" section
- Difficulty selection on game cards and in-game
- Polished kid-friendly UI with micro-animations
- Tested on Windows (Tauri) and Android (Capacitor)

#### 1.1 — Search & Filtering
- Integrate Fuse.js with weighted multi-field search (name, category, tags)
- Build `SearchBar` component with autocomplete dropdown and recent searches
- Build `CategoryFilter` component (horizontal scroll pills, 8 categories)
- Implement `FilterState` management with URL serialization (`?cat=arcade&diff=easy`)
- Build `DifficultySelector` component (Easy 🌱 / Medium 🔥 / Hard 🏔️)
- Implement multi-criteria filtering (AND between dimensions, OR within)

#### 1.2 — Score & Favorites System
- Build score submission flow with player name prompt (localStorage)
- Build per-game leaderboard UI (top 10 table with difficulty tabs)
- Build "New High Score!" celebration (confetti animation)
- Build favorites toggle on game cards (heart with particle animation)
- Build favorites toggle in-game toolbar
- Build "My Favorites" horizontal scroll section on home page
- Build `FavoritesPage` route
- Implement score export/import (JSON file download/upload)

#### 1.3 — UI Polish & Animations
- Implement all 13 components from the design system (GameCard, CategoryFilter, SearchBar, etc.)
- Add micro-animations: card hover lift, category pill select, heart bounce, loading shimmer
- Add game loading 7-phase sequence (card expand → loading → asset preload → engine init → ready screen → countdown → play)
- Build `EmptyState` component (no results, no favorites)
- Build `LoadingSkeleton` shimmer cards
- Implement dark mode with cozy navy palette and glow effects
- Add `prefers-reduced-motion` media query support
- Implement responsive layout: sidebar (desktop) ↔ bottom nav (mobile)
- Test on 3 breakpoints: mobile (375px), tablet (768px), desktop (1280px)

#### 1.4 — Additional Games (12 more, total 15)
**Canvas Games (7):**
- Tic-Tac-Toe (Board, Easy) — AI opponent with 3 difficulty levels
- 2048 (Logic/Puzzle, Easy) — Grid sliding with 3 board sizes
- Minesweeper (Logic/Puzzle, Easy) — 3 grid sizes and mine counts
- Connect Four (Board, Easy) — Column-drop with AI opponent
- Memory Match (Card, Easy) — Card flip matching with 3 grid sizes
- Mastermind (Logic/Puzzle, Easy) — Code-breaking with feedback
- Cookie Clicker (Action, Easy) — Incremental idle game

**Kaboom Games (3):**
- Pong (Arcade, Easy) — 2-player and vs AI
- Flappy Bird (Arcade, Easy) — Tap to fly with 3 gap/speed settings
- Whack-a-Mole (Action, Easy) — Timed reflex game

**Phaser Game (1):**
- Asteroids (Arcade, Medium) — Rotating ship, shooting, wrapping screen

**Board Game (1):**
- Checkers (Board, Medium) — AI opponent with minimax

#### 1.5 — Cross-Platform Validation
- Test Tauri Windows app: fullscreen, window controls, keyboard shortcuts
- Test Capacitor Android app: touch controls, back button, safe areas, status bar
- Test PWA install flow on Chrome, Safari, Firefox
- Test offline mode: load cached games without network
- Fix platform-specific bugs (CSP issues, WebView quirks, touch event handling)
- Optimize Android performance (reduce Kaboom/Phaser overhead on WebView)

#### 1.6 — Game Utility Improvements
- Refine `SoundManager`: add audio sprite support, per-game sound registration/unregistration
- Refine `ScoreTracker`: add score formatting per game (time, length, points)
- Add `InputHelper` utility for unified keyboard/touch/gamepad input
- Add `GameTimer` utility (pause-aware timer for timed games)
- Add game difficulty helper (provides params per difficulty level)

**Phase 1 Milestone:** PlayBox has 15+ games, full search/filter/scores/favorites, polished UI, and works on web, Windows, and Android.

---

### Phase 2 — Scale & Polish (30+ Games)

**Goal:** Expand to 30+ games, optimize performance, conduct accessibility audit, and prepare for full release.

**After Phase 2, the user has:**
- 30+ playable games
- Performance-optimized for slow devices and mobile networks
- Full accessibility compliance (WCAG AA, COPPA)
- Comprehensive test suite
- Pre-rendered game thumbnails and optimized assets

#### 2.1 — Performance Optimization
- Implement `dorny/paths-filter` in CI to skip unchanged games
- Add Vite chunk size analysis (`rollup-plugin-visualizer`)
- Optimize Phaser chunk: investigate tree-shaking or Phaser Lite
- Implement game preloading strategy (preload adjacent games in same category)
- Add Lighthouse CI for performance regression detection
- Optimize images: convert thumbnails to WebP, add lazy loading
- Implement virtual scrolling for game grid (if needed at 30+ games)

#### 2.2 — Accessibility Audit & Compliance
- WCAG AA contrast audit for all color combinations
- Keyboard navigation audit: tab order, focus indicators, skip links
- Screen reader testing with NVDA/VoiceOver
- Touch target audit: all interactive elements ≥ 44px
- COPPA compliance review: no data collection from children under 13
- Language audit: all UI text at 2nd–3rd grade reading level
- Add ARIA labels and roles to all components
- Test with `prefers-reduced-motion` enabled

#### 2.3 — Testing Suite
- Write unit tests for each game (validate PlayBoxGame contract)
- Write integration tests for GameWrapper lifecycle (mount/unmount/pause/resume)
- Write Playwright E2E tests for critical user journeys (browse → play → score → favorite)
- Write memory leak tests (5 mount/unmount cycles, check heap growth)
- Write CI smoke tests (build succeeds, no console errors)
- Set up test coverage reporting

#### 2.4 — Additional Games (15 more, total 30)
**Canvas Games (8):**
- Chess (Board, Hard) — Full rules + AI with minimax
- Reversi/Othello (Board, Medium) — AI opponent
- Solitaire/Klondike (Card, Medium) — Drag-and-drop card game
- Battleship (Strategy, Medium) — Hidden grid, AI opponent
- 15-Puzzle (Logic/Puzzle, Easy) — Sliding tile puzzle
- Tower of Hanoi (Logic/Puzzle, Easy) — Recursive puzzle
- Lights Out (Logic/Puzzle, Easy) — Toggle grid puzzle
- Simon Says (Logic/Puzzle, Easy) — Memory sequence game

**Kaboom Games (4):**
- Space Invaders (Arcade, Medium) — Formation enemies, shields
- Frogger (Arcade, Medium) — Lane crossing with obstacles
- Doodle Jump (Action, Medium) — Vertical platformer
- Air Hockey (Sports, Medium) — 2-player physics game

**Phaser Games (3):**
- Pac-Man (Arcade, Hard) — Maze navigation, ghosts AI
- Fruit Ninja (Arcade, Medium) — Swipe cutting game
- Tower Defense (Strategy, Hard) — Path-based tower placement

#### 2.5 — Asset & Content Production
- Create original thumbnails for all 30 games (consistent art style)
- Create game sprites and assets (or source free/open assets)
- Optimize all assets: WebP for images, compressed audio (OGG/MP3)
- Create PWA screenshots for install prompt
- Create app icons for Windows (.ico) and Android (mipmap-*)

**Phase 2 Milestone:** PlayBox has 30+ games, is performance-optimized, accessibility-compliant, and has comprehensive test coverage.

---

### Phase 3 — Full Release (55 Games, v1.0.0)

**Goal:** All 55 games implemented, production-signed builds, v1.0.0 release.

**After Phase 3, the user has:**
- All 55 games playable
- Production-signed Windows installer (no SmartScreen warnings)
- Signed Android APK (publishable to Play Store)
- v1.0.0 release on GitHub
- Complete documentation

#### 3.1 — Remaining Games (25 more, total 55)
**Canvas Games (13):**
- Nonogram (Logic/Puzzle, Medium) — Grid picture puzzle
- Picross (Logic/Puzzle, Medium) — Number grid puzzle
- Word Search (Logic/Puzzle, Easy) — Find words in letter grid
- Pattern Memory (Logic/Puzzle, Easy) — Visual memory game
- Go 9×9 (Board, Hard) — Territory game with AI
- Backgammon (Board, Hard) — Dice + strategy game
- Blackjack (Card, Easy) — Casino card game
- Spider Solitaire (Card, Medium) — Multi-suit solitaire
- Crazy Eights (Card, Medium) — Shedding card game
- Conway's Game of Life (Strategy, Easy) — Cellular automaton
- Peg Solitaire (Strategy, Easy) — Jump puzzle
- Coloring Book (Casual, Easy) — Digital coloring
- Dress-Up Doll (Casual, Easy) — Drag-and-drop outfit selection

**Kaboom Games (7):**
- Ludo (Board, Medium) — Dice race game
- Bubble Shooter (Casual, Medium) — Aim and shoot bubbles
- Candy Match-3 (Casual, Medium) — Swap and match
- Basketball Shots (Sports, Medium) — Angle/power shooting
- Stack Ball (Action, Medium) — Falling stack game
- Snowball Fight (Casual, Medium) — Seasonal throw game
- Pumpkin Pop (Arcade, Easy) — Seasonal click game
- Egg Catch (Casual, Easy) — Seasonal catch game

**Phaser Games (5):**
- Galaga (Arcade, Medium) — Formation shooter
- Jetpack Joyride (Action, Hard) — Side-scrolling runner
- Ping Pong 3D (Sports, Hard) — Pseudo-3D paddle game
- Jigsaw Puzzle (Casual, Medium) — Drag-and-drop puzzle assembly

#### 3.2 — Production Signing
- Purchase or obtain Windows code signing certificate
- Configure `TAURI_SIGNING_PRIVATE_KEY` secret in GitHub
- Configure `WINDOWS_CERTIFICATE_BASE64` secret for Authenticode signing
- Generate Android keystore and configure signing secrets
- Test signed builds: verify no SmartScreen warning on Windows
- Test signed APK: verify installable on Android without warnings

#### 3.3 — Final Polish
- Complete accessibility audit across all 55 games
- Performance audit: Lighthouse score ≥ 90 for Performance, Accessibility, Best Practices
- Cross-browser testing: Chrome, Firefox, Safari, Edge
- Cross-platform testing: Windows 10/11, Android 8+, iOS Safari (PWA)
- Fix all critical and high-severity bugs
- Verify PWA offline mode works with all 55 games (cached after first play)

#### 3.4 — Documentation & v1.0.0 Release
- Write README.md with setup instructions, development guide, and game addition guide
- Write CONTRIBUTING.md for open-source contributors
- Update version to 1.0.0 in package.json, tauri.conf.json, build.gradle
- Create v1.0.0 GitHub Release with all artifacts and changelog
- Mark release as "Latest" (not prerelease)

**Phase 3 Milestone:** PlayBox v1.0.0 is released with all 55 games, production-signed builds, and complete documentation.

---

## 5. Dependencies & Critical Path

### Phase Dependencies

```
Phase 0 (Rapid Prototype)
    │
    ▼
Phase 1 (Feature Complete - 15+ Games)
    │
    ▼
Phase 2 (Scale & Polish - 30+ Games)
    │
    ▼
Phase 3 (Full Release - 55 Games, v1.0.0)
```

### Critical Path

The critical path is the sequence of phases that determines the shortest possible completion time:

```
Phase 0 → Phase 1 → Phase 2 → Phase 3
```

All phases are sequential because each builds on the previous one:

- **Phase 0** must complete first because it establishes the game interface contract, platform shell, and CI/CD pipeline that all subsequent phases depend on.
- **Phase 1** depends on Phase 0's infrastructure to add features and games.
- **Phase 2** depends on Phase 1's feature set to add optimization and testing at scale.
- **Phase 3** depends on Phase 2's stable foundation to add the remaining games and sign production builds.

### Internal Phase Dependencies

Within each phase, sub-phases have their own dependencies:

**Phase 0:**
```
0.1 (Scaffolding) → 0.2 (Shell) → 0.3 (Services) → 0.4 (Games) → 0.5 (CI/CD) → 0.6 (PWA)
```
All sub-phases are sequential because each depends on the previous one's output.

**Phase 1:**
```
1.1 (Search/Filter) ─┐
1.2 (Scores/Favs)  ──┤──→ 1.3 (UI Polish) → 1.4 (Games) → 1.5 (Cross-Platform) → 1.6 (Utilities)
1.3 (UI Polish)    ──┘
```
1.1 and 1.2 can proceed in parallel. 1.3 depends on both. 1.4–1.6 are sequential.

**Phase 2:**
```
2.1 (Perf) ──────┐
2.2 (A11y) ──────┤──→ 2.3 (Testing) → 2.4 (Games) → 2.5 (Assets)
2.3 (Testing) ───┘
```
2.1 and 2.2 can proceed in parallel. 2.3 depends on both. 2.4–2.5 are sequential.

**Phase 3:**
```
3.1 (Games) → 3.2 (Signing) → 3.3 (Polish) → 3.4 (Release)
```
All sequential. Signing must happen before final polish verification. Release is last.

---

## 6. Risk Assessment

### Risk 1: Phaser 3 Bundle Size
**Impact:** High — 350KB gzipped chunk that must load before any Phaser game starts.  
**Likelihood:** Certain — Phaser's monolithic architecture makes tree-shaking nearly impossible.  
**Mitigation:** (1) Phaser is a shared chunk — loaded once, cached for all Phaser games. (2) Cache-on-play PWA strategy means Phaser is only downloaded when a user first plays a Phaser game. (3) Only 11 of 55 games use Phaser (20%). (4) Investigate Phaser Lite or custom builds for future optimization.

### Risk 2: Kaboom.js Cleanup Issues
**Impact:** Medium — Memory leaks when switching away from Kaboom games.  
**Likelihood:** Likely — Kaboom has no official `destroy()` method.  
**Mitigation:** (1) Navigate to empty cleanup scene + null context on unmount. (2) `GameWrapper` forcibly clears `container.innerHTML` as safety net. (3) Memory leak tests in CI (5 mount/unmount cycles with heap growth assertion). (4) Consider contributing `destroy()` upstream to Kaboom.

### Risk 3: Android WebView Performance
**Impact:** Medium — Kaboom and Phaser games may run slowly on older Android devices.  
**Likelihood:** Possible — WebView performance varies widely across Android versions and manufacturers.  
**Mitigation:** (1) Target minSdk 24 (Android 7.0+) for reasonable WebView baseline. (2) Test on low-end device early in Phase 1. (3) Add "reduce animations" setting for low-performance devices. (4) Canvas games (51%) run well on any WebView.

### Risk 4: CI/CD Build Times
**Impact:** Medium — With 55 games, Vite build + Tauri Rust compilation + Gradle Android build could take 15+ minutes.  
**Likelihood:** Likely — Build time grows with game count.  
**Mitigation:** (1) Caching: Node (npm cache), Rust (swatinem/rust-cache), Gradle (cache: gradle). (2) `dorny/paths-filter` to skip unchanged game tests. (3) Parallel jobs for Windows/Android. (4) Target: <6 minutes warm build, <15 minutes cold build.

### Risk 5: Scope Creep (55 Games)
**Impact:** High — 55 games is a massive scope. Each game needs implementation, testing, assets, and maintenance.  
**Likelihood:** Likely — Especially with an AI agent doing the development.  
**Mitigation:** (1) Phased approach: 3 → 15 → 30 → 55 games. (2) Prioritize Easy-complexity games first (42% of catalog). (3) Standardized interface means each game is independent — no cross-game dependencies. (4) Each game is testable in isolation. (5) Automated registry means zero-config game addition.

### Risk 6: PWA Cache Invalidation
**Impact:** Medium — Users may see stale game versions after updates.  
**Likelihood:** Possible — Service worker caching can be tricky to get right.  
**Mitigation:** (1) Use `vite-plugin-pwa` with `registerType: 'autoUpdate'` — service worker updates automatically. (2) Version game assets with content hashes (Vite default). (3) Add "Update available" toast notification. (4) Test cache invalidation in CI.

### Risk 7: Cross-Platform Consistency
**Impact:** Medium — Games may behave differently in browser vs Tauri WebView vs Android WebView.  
**Likelihood:** Possible — Different WebView implementations have subtle differences.  
**Mitigation:** (1) Platform abstraction layer (`src/lib/platform.ts`) normalizes differences. (2) Test on all 3 platforms in Phase 1.5 and Phase 2.5. (3) Use `capacitor.config.ts` `androidScheme: 'https'` for secure context. (4) CSP policy tested across all platforms.

---

## 7. Next Steps

1. **Initialize the repository** — Create the Git repo, scaffold the Vite + React + TypeScript project, and push to GitHub.
2. **Define the `PlayBoxGame` interface** — Write `src/types/game.ts` as the canonical contract. Every game and all platform code depends on this.
3. **Build the platform shell** — Get `HomePage`, `GameCard`, `GameWrapper`, and `GamePage` working with a single placeholder game.
4. **Implement the first game (Sudoku)** — Validate the full pipeline: metadata → lazy import → mount → play → score → unmount.
5. **Set up CI/CD** — Get auto-deploy to GitHub Pages working first, then add Windows and Android builds.
6. **Iterate** — Follow the Phase 0 → 1 → 2 → 3 roadmap, validating at each milestone.
