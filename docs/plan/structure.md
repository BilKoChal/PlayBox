# PlayBox — Current Project Structure

**Last Updated:** 2026-05-28  
**Phase:** 0.1 Complete

---

```
playbox/
├── .github/                              # (Not yet created — Phase 0.5)
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
│   │   │   └── 1 - Project Scaffolding and Configuration.md
│   │   ├── worklogs/
│   │   │   └── 1 - worklog.md
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
│   ├── games/                            # Static game assets (placeholder)
│   ├── manifest.json                     # PWA manifest
│   └── robots.txt                        # Robots file
│
├── scripts/
│   ├── generate-game-registry.ts         # Scans src/games/ → generates registry
│   ├── check-game-interface.ts           # Validates PlayBoxGame compliance
│   └── copy-404.js                       # SPA routing fix for GitHub Pages
│
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Root component (minimal shell)
│   ├── vite-env.d.ts                     # Vite + Tauri + PWA type declarations
│   │
│   ├── components/                       # UI Components
│   │   ├── layout/                       # (Empty — Phase 0.2)
│   │   ├── game/                         # (Empty — Phase 0.2)
│   │   ├── ui/                           # (Empty — Phase 0.2)
│   │   └── feedback/                     # (Empty — Phase 0.2)
│   │
│   ├── contexts/                         # React Contexts
│   │   ├── ThemeContext.tsx              # Light/dark theme toggle
│   │   ├── SoundContext.tsx             # Global mute toggle
│   │   └── GameContext.tsx              # Active game tracking
│   │
│   ├── hooks/                            # Custom Hooks (Empty — Phase 0.2/0.3)
│   │
│   ├── lib/                              # Shared Libraries
│   │   ├── audio.ts                      # SoundManager (Web Audio API stub)
│   │   ├── storage.ts                    # ScoreTracker (Dexie.js + IndexedDB)
│   │   ├── platform.ts                   # Platform detection (web/tauri/capacitor)
│   │   ├── fullscreen.ts                # FullscreenService (cross-platform)
│   │   └── search.ts                     # Fuse.js search engine
│   │
│   ├── pages/                            # Page Components (Empty — Phase 0.2)
│   │
│   ├── games/                            # All Games (Empty — Phase 0.4)
│   │
│   ├── types/
│   │   └── game.ts                       # ★ PlayBoxGame interface (canonical)
│   │
│   ├── styles/
│   │   └── globals.css                   # Tailwind + PlayBox design tokens
│   │
│   ├── game-registry.ts                  # Registry lookup helpers
│   └── game-registry.generated.ts        # (Auto-generated — Phase 0.4)
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
├── vite.config.ts                        # Vite build config
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
| 0.2 | Platform Shell (Basic UI) | ⬜ Not started |
| 0.3 | Shared Services (Core) | ⬜ Not started |
| 0.4 | MVP Games (3 Games) | ⬜ Not started |
| 0.5 | CI/CD Pipeline | ⬜ Not started |
| 0.6 | PWA & Offline | ⬜ Not started |
