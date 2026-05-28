# PlayBox — Current Project Structure

**Last Updated:** 2026-05-28  
**Phase:** 0.5 Complete

---

```
playbox/
├── .github/                              # GitHub Actions CI/CD
│   └── workflows/
│       └── ci.yml                        # Full pipeline: test → pages → windows → android → release
│
├── android/                              # Capacitor Android build
│   ├── app/
│   │   ├── build.gradle                  # App-level Gradle config
│   │   └── src/main/
│   │       └── AndroidManifest.xml       # Android manifest
│   ├── build.gradle                      # Root Gradle config
│   └── settings.gradle                   # Gradle settings
│
├── docs/
│   ├── README.md                         # Planning package index
│   ├── plan/
│   │   ├── PlayBox_plan.md               # Main project plan (4 phases)
│   │   ├── PlayBox_synthesis.md          # Research synthesis
│   │   ├── structure.md                  # THIS FILE — project structure
│   │   ├── tasks/
│   │   │   ├── 1 - Project Scaffolding and Configuration.md
│   │   │   ├── 2 - Platform Shell.md
│   │   │   ├── 3 - Shared Services Core.md
│   │   │   ├── 4 - MVP Games (3 Games).md
│   │   │   └── 5 - CI_CD Pipeline.md
│   │   ├── worklogs/
│   │   │   ├── 1 - worklog.md
│   │   │   ├── 2 - worklog.md
│   │   │   ├── 3 - worklog.md
│   │   │   ├── 4 - worklog.md
│   │   │   └── 5 - worklog.md
│   │   └── research/                     # (Empty — research in docs/reports/)
│   └── reports/
│       ├── PlayBox_architect_report.md   # Architecture research
│       ├── PlayBox_game_engine_report.md # Game engine research
│       ├── PlayBox_cicd_report.md        # CI/CD research
│       ├── PlayBox_uiux_report.md        # UI/UX research
│       └── PlayBox_catalog_report.md     # Game catalog research
│
├── public/
│   ├── icons/                            # PWA icons (placeholder)
│   ├── games/                            # Game assets & thumbnails
│   │   ├── sudoku/
│   │   │   └── thumbnail.png             # AI-generated Sudoku thumbnail
│   │   ├── snake/
│   │   │   └── thumbnail.png             # AI-generated Snake thumbnail
│   │   └── breakout/
│   │       └── thumbnail.png             # AI-generated Breakout thumbnail
│   ├── manifest.json                     # PWA manifest
│   └── robots.txt                        # Robots file
│
├── scripts/
│   ├── generate-game-registry.ts         # Scans src/games/ → generates registry
│   ├── check-game-interface.ts           # Validates PlayBoxGame compliance
│   └── copy-404.js                       # SPA routing fix for GitHub Pages (ESM)
│
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Root component with routing + providers
│   ├── vite-env.d.ts                     # Vite + Tauri + PWA type declarations
│   │
│   ├── components/                       # UI Components
│   │   ├── layout/                       # Header, Footer
│   │   ├── game/                         # GameCard, GameWrapper, GameOverlay
│   │   ├── ui/                           # Button, Toggle, SearchBar, Badge, Modal
│   │   └── feedback/                     # Toast, ScoreDisplay, EmptyState
│   │
│   ├── contexts/                         # React Contexts
│   │   ├── ThemeContext.tsx              # Light/dark theme toggle
│   │   ├── SoundContext.tsx             # Global mute toggle
│   │   └── GameContext.tsx              # Active game tracking
│   │
│   ├── hooks/                            # Custom Hooks
│   │   ├── useFavorites.ts              # Favorites management
│   │   ├── useFullscreen.ts             # Fullscreen API hook
│   │   └── useSearch.ts                 # Search with debounce
│   │
│   ├── lib/                              # Shared Libraries
│   │   ├── audio.ts                      # SoundManager (Web Audio API, procedural sounds)
│   │   ├── storage.ts                    # ScoreTracker + PlayerNameManager + SettingsManager
│   │   ├── favorites.ts                  # FavoritesManager (localStorage, singleton)
│   │   ├── platform.ts                   # Platform detection (web/tauri/capacitor)
│   │   ├── fullscreen.ts                # FullscreenService (cross-platform)
│   │   └── search.ts                     # Fuse.js search engine
│   │
│   ├── pages/                            # Page Components
│   │   ├── HomePage.tsx                  # Game catalog
│   │   ├── GamePage.tsx                  # Individual game play
│   │   ├── FavoritesPage.tsx             # Favorites collection
│   │   └── SettingsPage.tsx             # Global settings
│   │
│   ├── games/                            # ★ ALL GAMES LIVE HERE
│   │   ├── sudoku/                       # Sudoku (Canvas, Logic/Puzzle)
│   │   │   ├── index.ts                  # PlayBoxGame implementation
│   │   │   ├── SudokuGame.ts             # Core logic (generation, solving)
│   │   │   ├── SudokuRenderer.ts         # Canvas 2D rendering
│   │   │   └── types.ts                  # Sudoku-specific types
│   │   ├── snake/                        # Snake (Kaboom, Arcade)
│   │   │   └── index.ts                  # Complete Snake game
│   │   └── breakout/                     # Breakout (Kaboom, Arcade)
│   │       └── index.ts                  # Complete Breakout game
│   │
│   ├── types/
│   │   └── game.ts                       # ★ PlayBoxGame interface (canonical)
│   │
│   ├── styles/
│   │   └── globals.css                   # Tailwind + PlayBox design tokens
│   │
│   ├── game-registry.ts                  # Registry lookup helpers
│   └── game-registry.generated.ts        # ★ Game registry (3 games registered)
│
├── src-tauri/                            # Tauri v2 (Windows desktop)
│   ├── Cargo.toml                        # Rust manifest
│   ├── tauri.conf.json                   # Tauri app config
│   ├── src/
│   │   ├── main.rs                       # Rust entry point
│   │   └── lib.rs                        # Tauri builder
│   └── icons/                            # (Placeholder)
│
├── capacitor.config.ts                   # Capacitor 6 config (Android)
├── index.html                            # SPA entry HTML
├── package.json                          # Project manifest (0.1.0)
├── pnpm-lock.yaml                        # Lock file
├── tsconfig.json                         # TypeScript config (strict)
├── tsconfig.node.json                    # TypeScript node config (composite)
├── vite.config.ts                        # Vite build config (code splitting)
├── postcss.config.js                     # PostCSS config
├── .eslintrc.cjs                         # ESLint config
├── .prettierrc                           # Prettier config
├── .gitignore                            # Git ignore rules
├── .gitattributes                        # Git attributes
├── LICENSE                               # MIT License
└── prompt.md                             # Development Agent prompt (v2)
```

---

## Implementation Status

| Phase | Sub-Phase | Status |
|-------|-----------|--------|
| 0.1 | Project Scaffolding & Configuration | ✅ Complete |
| 0.2 | Platform Shell (Basic UI) | ✅ Complete |
| 0.3 | Shared Services (Core) | ✅ Complete |
| 0.4 | MVP Games (3 Games) | ✅ Complete |
| 0.5 | CI/CD Pipeline | ✅ Complete |
| 0.6 | PWA & Offline | ⬜ Not started |

## Registered Games

| Game | Engine | Category | Difficulties |
|------|--------|----------|-------------|
| Sudoku | Canvas | Logic/Puzzle | Easy (4×4), Medium (6×6), Hard (9×9) |
| Snake | Kaboom | Arcade | Easy (slow+wrap), Medium, Hard (fast+death) |
| Breakout | Kaboom | Arcade | Easy (wide paddle), Medium, Hard (narrow paddle) |

## CI/CD Pipeline

| Job | Trigger | Runs On | Output |
|-----|---------|---------|--------|
| test | PR + push to main | ubuntu-latest | Build verified |
| deploy-pages | Push to main | ubuntu-latest | GitHub Pages live |
| build-windows | Push to main | windows-latest | .exe + .msi artifacts |
| build-android | Push to main | ubuntu-latest | .apk artifact |
| release | Push to main (after all builds) | ubuntu-latest | GitHub Release v0.1.0 |
