# PlayBox — Architecture Report

**Author:** General / Overall Architect  
**Date:** 2025-03-04  
**Version:** 0.1.0-draft  
**Status:** Pre-implementation  

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Module Boundaries](#2-module-boundaries)
3. [Dependency Management](#3-dependency-management)
4. [Build System](#4-build-system)
5. [Integration Architecture](#5-integration-architecture)
6. [PWA Architecture](#6-pwa-architecture)
7. [Risk Assessment](#7-risk-assessment)

---

## 1. Project Structure

### 1.1 Design Rationale

PlayBox is a single flat repository — no pnpm workspaces, no Turborepo, no Lerna. This decision was made intentionally: with 50+ games, workspace tooling adds overhead that is unjustified when all packages share the same `package.json` and Vite build pipeline. Instead, we rely on Vite's native code-splitting and dynamic imports to achieve per-game lazy loading. Every game is simply a directory under `src/games/` that exports a well-defined interface. The React platform shell lives at the root `src/` level and is the sole entry point of the application.

The key structural principle is **convention over configuration**: a game's presence in `src/games/<id>/index.ts` is all the registration needed. A build-time script (`scripts/generate-game-registry.ts`) scans this directory and produces `src/game-registry.generated.ts`, which the shell imports to populate the game catalog. This means adding a new game is as simple as creating a directory and implementing the game interface — no manual registration, no configuration files to edit.

### 1.2 Complete Tree Diagram

```
playbox/
├── .github/
│   └── workflows/
│       ├── deploy.yml                    # GitHub Pages deployment
│       ├── release-tauri.yml             # Windows Tauri build + release
│       └── release-android.yml           # Capacitor Android build + release
│
├── public/
│   ├── icons/                            # PWA icons (192, 512, maskable)
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── maskable-512.png
│   ├── screenshots/                      # PWA install screenshots
│   ├── games/                            # Static game assets (sprites, tilemaps, audio)
│   │   ├── snake/
│   │   ├── flappy-bird/
│   │   └── ...
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Root component with router + providers
│   ├── vite-env.d.ts                     # Vite type declarations
│   │
│   ├── components/                       # Shared React UI components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── GameGrid.tsx
│   │   ├── game/
│   │   │   ├── GameContainer.tsx         # Wrapper that mounts/unmounts games
│   │   │   ├── GameOverlay.tsx           # Pause/settings overlay
│   │   │   └── GameCard.tsx             # Card for catalog browsing
│   │   ├── ui/                           # Primitive UI components (button, modal, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── Badge.tsx
│   │   └── feedback/
│   │       ├── Toast.tsx
│   │       └── ScoreDisplay.tsx
│   │
│   ├── hooks/                            # Shared React hooks
│   │   ├── useGame.ts                    # Game lifecycle management
│   │   ├── useHighScore.ts               # Local high score persistence
│   │   ├── useFavorites.ts               # Favorites management
│   │   ├── useSound.ts                   # Global sound toggle
│   │   ├── useFullscreen.ts              # Fullscreen API wrapper
│   │   ├── useTheme.ts                   # Theme toggle (light/dark)
│   │   └── useSearch.ts                  # Search with debounce
│   │
│   ├── contexts/                         # React context providers
│   │   ├── ThemeContext.tsx
│   │   ├── SoundContext.tsx
│   │   └── GameContext.tsx
│   │
│   ├── pages/                            # Route-level page components
│   │   ├── HomePage.tsx                  # Game catalog / lobby
│   │   ├── GamePage.tsx                  # Individual game play page
│   │   ├── FavoritesPage.tsx             # Favorites collection
│   │   └── SettingsPage.tsx              # Global settings
│   │
│   ├── lib/                              # Shared utility libraries
│   │   ├── storage.ts                    # IndexedDB + localStorage abstraction
│   │   ├── audio.ts                      # Web Audio API sound manager
│   │   ├── analytics.ts                  # Lightweight event tracking (optional)
│   │   └── platform.ts                   # Platform detection (web/tauri/capacitor)
│   │
│   ├── types/                            # Shared TypeScript types
│   │   ├── game.ts                       # Game interface, metadata, categories
│   │   └── platform.d.ts                 # Tauri/Capacitor global type augments
│   │
│   ├── styles/                           # Global styles
│   │   └── globals.css                   # Tailwind directives + custom properties
│   │
│   ├── games/                            # *** ALL GAMES LIVE HERE ***
│   │   ├── snake/
│   │   │   ├── index.ts                  # Exports GameInterface implementation
│   │   │   ├── SnakeGame.tsx             # React component (Canvas game)
│   │   │   └── assets/                   # Game-specific static assets
│   │   │       └── apple.svg
│   │   │
│   │   ├── 2048/
│   │   │   ├── index.ts
│   │   │   ├── Game2048.tsx
│   │   │   └── logic.ts
│   │   │
│   │   ├── flappy-bird/
│   │   │   ├── index.ts
│   │   │   ├── FlappyBirdGame.ts         # Kaboom.js game class
│   │   │   └── sprites/                  # Kaboom sprite assets
│   │   │       ├── bird.png
│   │   │       └── pipe.png
│   │   │
│   │   ├── chess/
│   │   │   ├── index.ts
│   │   │   ├── ChessGame.ts              # Phaser 3 scene class
│   │   │   ├── scenes/
│   │   │   │   ├── BoardScene.ts
│   │   │   │   └── MenuScene.ts
│   │   │   └── assets/
│   │   │       └── pieces/               # Sprite sheet for chess pieces
│   │   │
│   │   ├── tic-tac-toe/
│   │   │   ├── index.ts
│   │   │   └── TicTacToeGame.tsx
│   │   │
│   │   └── .../                          # 45+ more game directories
│   │
│   ├── game-registry.generated.ts        # Auto-generated: maps game IDs → lazy imports
│   └── game-registry.ts                  # Hand-written: registry lookup helpers
│
├── src-tauri/                            # Tauri v2 native shell (Windows)
│   ├── Cargo.toml                        # Rust dependencies
│   ├── tauri.conf.json                   # Tauri configuration
│   ├── icons/                            # Windows app icons
│   ├── src/
│   │   ├── main.rs                       # Tauri entry point
│   │   └── lib.rs                        # Tauri commands (if any native features)
│   └── capabilities/
│       └── default.json                  # Tauri v2 capability/permission config
│
├── android/                              # Capacitor Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/.../MainActivity.java
│   │   │   └── res/
│   │   │       ├── mipmap-*/             # Android app icons
│   │   │       └── values/
│   │   └── build.gradle
│   ├── build.gradle
│   ├── settings.gradle
│   └── capacitor-cordova-android-plugins/
│
├── scripts/
│   ├── generate-game-registry.ts         # Scans src/games/ → generates registry
│   └── check-game-interface.ts           # Validates all games implement GameInterface
│
├── index.html                            # Vite HTML entry
├── package.json                          # Single package.json for entire project
├── pnpm-lock.yaml                        # Lockfile (pnpm for disk efficiency)
├── tsconfig.json                         # TypeScript config
├── tsconfig.node.json                    # TS config for Node scripts
├── vite.config.ts                        # Vite configuration (multi-platform build)
├── capacitor.config.ts                   # Capacitor configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS for Tailwind
├── .prettierrc                           # Code formatting
├── .eslintrc.cjs                         # Linting rules
└── README.md
```

### 1.3 Key Structural Decisions

**Why games live in `src/games/` and not `packages/` or `apps/`:** In a workspace architecture, each game would be its own package with its own `package.json`, `tsconfig.json`, and build pipeline. For 50+ games, this creates massive configuration sprawl and makes adding a game a 10-step process. By keeping games as simple directories under `src/`, we treat them as modules of the same application — which they are. Vite's code splitting handles isolation at the bundle level.

**Why `src-tauri/` and `android/` are at the repo root:** Tauri v2 and Capacitor both expect their project directories at specific locations relative to the web build output. Tauri looks for `src-tauri/` at the project root by convention. Capacitor generates the `android/` directory at the project root. Placing them elsewhere would require additional configuration that adds complexity without benefit.

**Why `public/games/` exists alongside `src/games/`:** Game code (TypeScript, React components) lives in `src/games/`, but static assets like sprite sheets, tilemaps, and audio files that are too large or binary to import through Vite's asset pipeline live in `public/games/`. This avoids base64 inlining of large binary assets and enables the PWA service worker to cache them independently.

---

## 2. Module Boundaries

### 2.1 The Game Interface Contract

Every game in PlayBox must implement the `GameInterface` contract. This is the single most important architectural boundary in the system — it defines how the React platform shell communicates with any game, regardless of the underlying engine (Canvas, Kaboom, Phaser). The contract is deliberately minimal to keep the barrier to entry low for adding new games, while being sufficient for the shell to manage game lifecycle, display metadata, and persist scores.

```typescript
// src/types/game.ts

/** Game difficulty levels supported by the platform */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Category tags for filtering and browsing */
export type GameCategory =
  | 'arcade'
  | 'puzzle'
  | 'board'
  | 'card'
  | 'strategy'
  | 'sports'
  | 'racing'
  | 'adventure'
  | 'trivia'
  | 'casual';

/** Engine tier — affects how the shell mounts the game */
export type GameEngine = 'canvas' | 'kaboom' | 'phaser';

/** Static metadata about a game — available before the game module loads */
export interface GameMeta {
  /** Unique slug identifier (matches directory name in src/games/) */
  id: string;
  /** Human-readable display name */
  title: string;
  /** Short description for the game card */
  description: string;
  /** Category tags for filtering */
  categories: GameCategory[];
  /** Which engine tier this game uses */
  engine: GameEngine;
  /** Path to thumbnail image (relative to public/) */
  thumbnail: string;
  /** Whether the game supports difficulty selection */
  supportsDifficulty: boolean;
  /** Default difficulty if not user-selected */
  defaultDifficulty: Difficulty;
  /** Game version for cache-busting and compatibility */
  version: string;
  /** Minimum screen width required (px), 0 = responsive */
  minWidth: number;
}

/** Runtime API provided by a running game instance */
export interface GameInstance {
  /** Called when the user pauses the game (shell overlay visible) */
  pause(): void;
  /** Called when the user resumes after a pause */
  resume(): void;
  /** Called when the user changes difficulty mid-game */
  setDifficulty(level: Difficulty): void;
  /** Called when global sound setting changes */
  setSoundEnabled(enabled: boolean): void;
  /** Clean up all resources, event listeners, animation frames, etc. */
  destroy(): void;
}

/** Callback the game calls to communicate back to the shell */
export interface GameCallbacks {
  /** Game reports a new score (e.g., points gained) */
  onScore: (score: number) => void;
  /** Game reports it has ended — shell shows game-over UI */
  onGameOver: (finalScore: number) => void;
  /** Game requests fullscreen mode (e.g., immersive games) */
  requestFullscreen: () => void;
  /** Game reports an error to the shell */
  onError: (error: Error) => void;
}

/** The full interface every game must export as default */
export interface GameInterface {
  /** Static metadata — available immediately after import */
  meta: GameMeta;
  /**
   * Mount the game into the provided DOM container.
   * Returns a GameInstance for the shell to control lifecycle.
   *
   * @param container - DOM element the game should render into
   * @param callbacks - Functions the game can call to talk to the shell
   * @param options - Runtime options (difficulty, sound, etc.)
   */
  mount(
    container: HTMLElement,
    callbacks: GameCallbacks,
    options: GameMountOptions
  ): Promise<GameInstance>;
}

/** Options passed to mount() at runtime */
export interface GameMountOptions {
  difficulty: Difficulty;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  /** If the game has a prior high score, pass it for "beat your record" UI */
  previousHighScore?: number;
}
```

### 2.2 Example Game Implementation

Here is how a simple Canvas-based game (Snake) implements the contract:

```typescript
// src/games/snake/index.ts

import type { GameInterface, GameInstance, GameCallbacks, GameMountOptions } from '../../types/game';

class SnakeInstance implements GameInstance {
  private animationFrameId: number = 0;
  private running: boolean = true;
  private soundEnabled: boolean = true;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private callbacks: GameCallbacks,
    private options: GameMountOptions
  ) {
    this.soundEnabled = options.soundEnabled;
    this.startGameLoop();
  }

  private startGameLoop() {
    const loop = () => {
      if (!this.running) return;
      this.update();
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private update() { /* snake movement, collision, etc. */ }
  private render() { /* draw to canvas */ }

  pause() { this.running = false; }
  resume() { this.running = true; this.startGameLoop(); }
  setSoundEnabled(enabled: boolean) { this.soundEnabled = enabled; }
  setDifficulty() { /* restart with new speed */ }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
    // Remove any DOM event listeners added during mount
  }
}

export const SnakeGame: GameInterface = {
  meta: {
    id: 'snake',
    title: 'Snake',
    description: 'Classic snake game — eat apples, grow longer, avoid walls!',
    categories: ['arcade', 'casual'],
    engine: 'canvas',
    thumbnail: '/games/snake/thumbnail.png',
    supportsDifficulty: true,
    defaultDifficulty: 'medium',
    version: '1.0.0',
    minWidth: 0,
  },

  async mount(container, callbacks, options): Promise<GameInstance> {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    return new SnakeInstance(ctx, callbacks, options);
  },
};

// Default export for dynamic import convention
export default SnakeGame;
```

### 2.3 Kaboom.js Game Implementation Pattern

Kaboom.js games require special handling because Kaboom takes over a canvas element. The key insight is that Kaboom's `kaboom()` function is impure — it initializes a global context. We must scope it to our container and clean it up properly:

```typescript
// src/games/flappy-bird/index.ts

import type { GameInterface, GameInstance, GameCallbacks, GameMountOptions } from '../../types/game';
import { kaboom } from 'kaboom';

class FlappyBirdInstance implements GameInstance {
  private k: ReturnType<typeof kaboom> | null = null;

  constructor(k: ReturnType<typeof kaboom>) {
    this.k = k;
  }

  pause() { this.k?.debug.pause(); }
  resume() { this.k?.debug.resume(); }
  setSoundEnabled(enabled: boolean) { /* toggle Kaboom volume */ }
  setDifficulty() { /* restart scene with harder params */ }

  destroy() {
    // Kaboom cleanup — remove canvas, stop all loops
    this.k?.quit();
    this.k = null;
  }
}

export const FlappyBirdGame: GameInterface = {
  meta: {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Tap to fly through the pipes!',
    categories: ['arcade'],
    engine: 'kaboom',
    thumbnail: '/games/flappy-bird/thumbnail.png',
    supportsDifficulty: false,
    defaultDifficulty: 'medium',
    version: '1.0.0',
    minWidth: 320,
  },

  async mount(container, callbacks, options): Promise<GameInstance> {
    const k = kaboom({
      canvas: document.createElement('canvas'),
      width: 320,
      height: 480,
      // Kaboom v3000+ supports scoped contexts
    });

    container.appendChild(k.canvas);

    // Load sprites relative to public root
    k.loadSprite('bird', '/games/flappy-bird/sprites/bird.png');
    k.loadSprite('pipe', '/games/flappy-bird/sprites/pipe.png');

    // Define scenes
    k.scene('game', () => {
      const bird = k.add([k.sprite('bird'), k.pos(80, 200), k.area(), k.body()]);

      k.onUpdate(() => {
        // Game logic
      });

      bird.onCollide('pipe', () => {
        callbacks.onGameOver(bird.pos.y < 0 ? 0 : Math.floor(bird.pos.y));
      });
    });

    k.go('game');
    return new FlappyBirdInstance(k);
  },
};

export default FlappyBirdGame;
```

### 2.4 Game Container Component

The React shell uses `GameContainer` as the bridge between the React world and the game world. This component handles mounting, unmounting, and the communication channel:

```typescript
// src/components/game/GameContainer.tsx

import { useEffect, useRef, useCallback, useState } from 'react';
import type { GameInterface, GameInstance, GameCallbacks } from '../../types/game';
import { useSound } from '../../hooks/useSound';
import { useFullscreen } from '../../hooks/useFullscreen';

interface GameContainerProps {
  game: GameInterface;
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameOver: (score: number) => void;
  onBack: () => void;
}

export function GameContainer({ game, difficulty, onGameOver, onBack }: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<GameInstance | null>(null);
  const { enabled: soundEnabled } = useSound();
  const { requestFullscreen } = useFullscreen();
  const [paused, setPaused] = useState(false);

  const callbacks: GameCallbacks = useCallback(() => ({
    onScore: (score) => { /* update display */ },
    onGameOver,
    requestFullscreen,
    onError: (err) => console.error(`[${game.meta.id}]`, err),
  }), [game.meta.id, onGameOver, requestFullscreen]);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    game.mount(containerRef.current, callbacks(), {
      difficulty: difficulty ?? game.meta.defaultDifficulty,
      soundEnabled,
      theme: 'light',
    }).then((instance) => {
      if (cancelled) { instance.destroy(); return; }
      instanceRef.current = instance;
    });

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
      // Clean up any leftover DOM children in the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [game, difficulty, soundEnabled, callbacks]);

  const handlePause = () => {
    if (paused) { instanceRef.current?.resume(); } 
    else { instanceRef.current?.pause(); }
    setPaused(!paused);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <GameOverlay
        paused={paused}
        onPause={handlePause}
        onBack={onBack}
        gameMeta={game.meta}
      />
    </div>
  );
}
```

### 2.5 Communication Flow Summary

```
┌─────────────────────────────────────────────────────┐
│                   React Platform Shell               │
│                                                      │
│  ┌──────────┐   mount()   ┌──────────────────────┐  │
│  │          │─────────────▶│   GameContainer.tsx  │  │
│  │ GamePage │              │   (bridge component) │  │
│  │          │◀─────────────│                      │  │
│  └──────────┘  onGameOver  └──────┬───────────────┘  │
│                                    │                  │
│                    callbacks       │  GameInstance    │
│                  ┌─────────────────┤                  │
│                  │                 │                  │
│                  ▼                 ▼                  │
│         ┌─────────────┐  ┌──────────────────┐        │
│         │ Canvas Game  │  │ Kaboom/Phaser    │        │
│         │ (Snake, 2048)│  │ (Flappy, Chess)  │        │
│         └─────────────┘  └──────────────────┘        │
└─────────────────────────────────────────────────────┘
```

The boundary is strict: the React shell never reaches into a game's internal state, and games never directly manipulate the shell's DOM or state. All communication flows through the `GameCallbacks` (game → shell) and `GameInstance` methods (shell → game).

---

## 3. Dependency Management

### 3.1 The Three-Engine Challenge

PlayBox uses three different game engines, each with distinct dependency characteristics:

| Engine | NPM Package | Bundle Size (min+gzip) | Usage |
|--------|------------|----------------------|-------|
| Plain Canvas | (none) | 0 KB | Logic games: Tic-Tac-Toe, 2048, Sudoku, Minesweeper |
| Kaboom.js | `kaboom` | ~40 KB | Simple arcade: Flappy Bird, Dino Runner, Breakout |
| Phaser 3 | `phaser` | ~350 KB (core) | Sprite-heavy: Chess, Platformer, Space Invaders |

The fundamental challenge: Phaser alone is 350 KB gzipped. If we naively import it in a single bundle, every user pays that cost even if they only play Snake. We must ensure each engine is loaded only when a game requiring it is actually played.

### 3.2 Single package.json Strategy

Since we use a flat repo (no workspaces), there is exactly one `package.json` at the root. All three engines are listed as production dependencies:

```json
{
  "name": "playbox",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0",
    "kaboom": "^3000.0.0",
    "phaser": "^3.80.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@tauri-apps/cli": "^2.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "vite-plugin-pwa": "^0.21.0",
    "workbox-window": "^7.1.0"
  }
}
```

### 3.3 Code Splitting — Engine Isolation

The critical strategy is ensuring that each engine's code ends up in a separate Vite chunk that is only loaded on demand. We achieve this through dynamic imports at the game level:

```typescript
// src/game-registry.generated.ts
// Auto-generated by scripts/generate-game-registry.ts

import type { GameInterface } from './types/game';

// Lazy load game modules — Vite creates separate chunks
// Each chunk will pull in its engine dependency only if that engine is used

type GameLoader = () => Promise<{ default: GameInterface }>;

export const gameLoaders: Record<string, GameLoader> = {
  'snake': () => import('./games/snake/index').then(m => ({ default: m.SnakeGame })),
  '2048': () => import('./games/2048/index').then(m => ({ default: m.Game2048 })),
  'flappy-bird': () => import('./games/flappy-bird/index').then(m => ({ default: m.FlappyBirdGame })),
  'chess': () => import('./games/chess/index').then(m => ({ default: m.ChessGame })),
  'tic-tac-toe': () => import('./games/tic-tac-toe/index').then(m => ({ default: m.TicTacToeGame })),
  // ... 45+ more games
};

// Static metadata is extracted separately — no engine code loaded for browsing
export const gameMetas: Record<string, GameMeta> = {
  'snake': { id: 'snake', title: 'Snake', engine: 'canvas', /* ... */ },
  '2048': { id: '2048', title: '2048', engine: 'canvas', /* ... */ },
  'flappy-bird': { id: 'flappy-bird', title: 'Flappy Bird', engine: 'kaboom', /* ... */ },
  'chess': { id: 'chess', title: 'Chess', engine: 'phaser', /* ... */ },
  'tic-tac-toe': { id: 'tic-tac-toe', title: 'Tic Tac Toe', engine: 'canvas', /* ... */ },
  // ... 45+ more games
};
```

When a user clicks on "Snake", only the Snake chunk loads (which is tiny — no engine). When they click "Flappy Bird", the Flappy Bird chunk loads, which triggers the Kaboom chunk to load as well. When they click "Chess", the Chess chunk loads along with the Phaser chunk. **A user who only plays Canvas games never downloads Kaboom or Phaser.**

### 3.4 Version Conflict Prevention

Phaser and Kaboom have no shared dependencies, which eliminates version conflicts between them. However, we must still be careful:

1. **Pin exact versions** in `package.json` for game engines: `"phaser": "3.80.1"` not `"^3.80.1"`. Game engines often have subtle behavior changes between minor versions that can break game logic.

2. **Deduplicate transitive deps** by using pnpm's strict resolution: `pnpm dedupe` should be run regularly. Vite's Rollup-based bundler will automatically deduplicate at build time, but keeping the node_modules clean prevents phantom bugs during development.

3. **Resolution overrides** if conflicts arise:
```json
{
  "pnpm": {
    "overrides": {
      "eventemitter3": "^5.0.0"
    }
  }
}
```

4. **No peer dependency games:** Games must not declare peer dependencies on engines. The engine is an implementation detail of the game module, not a shared interface. The `GameInterface` contract is the only shared interface.

### 3.5 Tree-Shaking and Bundle Optimization

Phaser 3 is notoriously difficult to tree-shake because it uses a monolithic class hierarchy. Our mitigation strategy:

```typescript
// ❌ BAD: Imports ALL of Phaser
import Phaser from 'phaser';

// ✅ BETTER: Still imports all, but makes it clear
import { Game, Scene, Types } from 'phaser';

// ✅ BEST (if Phaser supports it): Import only needed modules
// Unfortunately, Phaser 3 doesn't support granular imports well.
// This is an accepted trade-off — Phaser games pay the full ~350KB.
```

For Kaboom, the story is better — at ~40KB, the full library is small enough that tree-shaking is less critical, and Kaboom v3000+ is more modular.

For Canvas games, the bundle size is essentially zero beyond the game's own code.

**Total bundle size targets:**
- Initial shell load (React + UI + game catalog): < 100 KB gzipped
- Canvas game chunk: < 10 KB gzipped each
- Kaboom game chunk: < 50 KB gzipped each (including Kaboom runtime)
- Phaser game chunk: < 400 KB gzipped each (including Phaser runtime)
- **Critical:** Kaboom and Phaser are shared chunks — once loaded for one game, they're cached for all games using the same engine

### 3.6 Asset Management Strategy

Game assets (sprites, audio, tilemaps) present a unique challenge: they can be very large but should only load when needed. Our approach:

1. **Small assets (< 10 KB):** Import via Vite's standard asset pipeline. These get hashed filenames and inlined or bundled:
   ```typescript
   import appleSvg from './assets/apple.svg'; // Vite handles this
   ```

2. **Large assets (> 10 KB):** Place in `public/games/<id>/` and reference by URL. These are loaded at runtime by the game engine:
   ```typescript
   // In a Phaser game:
   this.load.image('board', '/games/chess/assets/board.png');
   ```

3. **Very large assets (> 1 MB, e.g., sprite sheets):** Consider splitting into smaller chunks or using WebP/AVIF format to reduce size. The PWA service worker will cache these on first use.

---

## 4. Build System

### 4.1 Vite Configuration

The Vite configuration is the heart of PlayBox's build system. It must handle three concerns: code splitting for 50+ lazy-loaded games, optimized output for each target platform, and PWA service worker generation.

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined;
  const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

  return {
    plugins: [
      react(),
      VitePWA({
        // PWA config detailed in Section 6
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
        manifest: false, // We manage manifest.json manually
        workbox: {
          // Detailed in Section 6
        },
      }),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@games': resolve(__dirname, 'src/games'),
        '@lib': resolve(__dirname, 'src/lib'),
      },
    },

    build: {
      // Base directory for relative asset paths
      // GitHub Pages: /playbox/ | Tauri: ./ | Capacitor: ./
      base: isTauri || isCapacitor ? './' : '/playbox/',

      outDir: 'dist',

      // Code splitting configuration
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Manual chunk strategy to isolate game engines
          manualChunks(id) {
            // Isolate Phaser into its own chunk
            if (id.includes('node_modules/phaser')) {
              return 'engine-phaser';
            }
            // Isolate Kaboom into its own chunk
            if (id.includes('node_modules/kaboom')) {
              return 'engine-kaboom';
            }
            // Group React + React-DOM together
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            // Group react-router together
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }
            // Each game becomes its own chunk via dynamic import
            // No manual chunk needed — Vite handles this automatically
          },
        },
      },

      // Target modern browsers for smaller output
      target: 'es2020',

      // Enable minification with terser for better dead code elimination
      minify: 'terser',

      // Chunk size warning limit — 500 KB is acceptable for Phaser chunks
      chunkSizeWarningLimit: 500,

      // Source maps for production debugging (stripped in Tauri/Capacitor release)
      sourcemap: mode === 'development',
    },

    // Development server configuration
    server: {
      port: 5173,
      // Tauri dev server proxy
      ...(isTauri && { strictPort: true }),
    },

    // Optimize dep pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      // Exclude game engines from pre-bundling — they're dynamically loaded
      exclude: ['phaser', 'kaboom'],
    },
  };
});
```

### 4.2 Code Splitting and Lazy Loading Strategy

With 50+ games, lazy loading is not optional — it's fundamental to the architecture. Here is the complete lazy loading flow:

```
User visits PlayBox
        │
        ▼
┌───────────────────────────┐
│  Shell loads (React + UI) │  ~100 KB gzipped
│  + Game catalog metadata  │  ~20 KB gzipped (just meta, no game code)
└───────────┬───────────────┘
            │
    User clicks "Flappy Bird"
            │
            ▼
┌───────────────────────────┐
│  Dynamic import() fires   │
│  for flappy-bird chunk    │
└───────────┬───────────────┘
            │
    ┌───────┴────────┐
    ▼                ▼
┌──────────┐  ┌──────────────┐
│ Engine   │  │ Game code    │
│ Kaboom   │  │ chunk loads  │
│ chunk    │  │ (small)      │
│ (~40KB)  │  │              │
└──────────┘  └──────────────┘
    │                │
    └───────┬────────┘
            ▼
    Game mounts and plays
```

The shell uses React.lazy + Suspense for game pages:

```typescript
// src/pages/GamePage.tsx

import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { gameLoaders, gameMetas } from '../game-registry.generated';
import { GameContainer } from '../components/game/GameContainer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const meta = gameMetas[gameId!];

  if (!meta) {
    return <div>Game not found</div>;
  }

  // The GameContainer handles the async mount internally
  // We lazy-load the game module here
  const GameModule = lazy(gameLoaders[gameId!]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GameModule>
        {/* GameModule exports GameInterface, GameContainer wraps it */}
      </GameModule>
    </Suspense>
  );
}
```

### 4.3 Multi-Platform Build Pipeline

PlayBox must produce three build artifacts from a single codebase:

**1. Web (GitHub Pages):**
```bash
# Standard Vite build
pnpm build
# Output: dist/ → deployed to GitHub Pages
```

**2. Tauri v2 (Windows .exe/.msi):**
```bash
# Tauri wraps the web build in a native window
pnpm tauri build
# Output: src-tauri/target/release/bundle/msi/PlayBox_0.1.0_x64.msi
#         src-tauri/target/release/bundle/nsis/PlayBox_0.1.0_x64-setup.exe
```

Tauri v2 configuration:
```json
// src-tauri/tauri.conf.json
{
  "$schema": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-cli/schema.json",
  "version": "0.1.0",
  "productName": "PlayBox",
  "identifier": "com.playbox.app",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build"
  },
  "app": {
    "windows": [
      {
        "title": "PlayBox — Game Station",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis"],
    "icon": ["icons/icon.ico"]
  }
}
```

**3. Capacitor (Android .apk/.aab):**
```bash
# Build web, then copy to Android project
pnpm build
CAPACITOR_BUILD=true pnpm cap sync android
pnpm cap build android
# Output: android/app/build/outputs/apk/release/app-release.apk
```

Capacitor configuration:
```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playbox.app',
  appName: 'PlayBox',
  webDir: 'dist',
  server: {
    // In production, assets are bundled — no server needed
    androidScheme: 'https',
  },
  plugins: {
    // Optional: add native plugins for haptic feedback, etc.
  },
};

export default config;
```

### 4.4 Build Script Overview

The complete build flow is orchestrated by the CI/CD pipeline, but can also be run locally:

```bash
# 1. Generate the game registry (scans src/games/ → creates registry file)
pnpm generate-registry

# 2. Validate all games implement the interface
pnpm check-games

# 3. Build for web
pnpm build

# 4. Build for Windows (Tauri)
pnpm tauri build

# 5. Build for Android (Capacitor)
CAPACITOR_BUILD=true pnpm build && pnpm cap sync android && cd android && ./gradlew assembleRelease
```

In `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "pnpm generate-registry && tsc && vite build",
    "preview": "vite preview",
    "generate-registry": "tsx scripts/generate-game-registry.ts",
    "check-games": "tsx scripts/check-game-interface.ts",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "cap:sync": "CAPACITOR_BUILD=true pnpm build && cap sync android",
    "cap:open": "cap open android",
    "cap:build": "pnpm cap:sync && cd android && ./gradlew assembleRelease",
    "lint": "eslint src/ --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 5. Integration Architecture

### 5.1 System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PlayBox Application                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     React Platform Shell                      │    │
│  │                                                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐│    │
│  │  │ Router   │  │ Theme    │  │ Sound    │  │ GameContext  ││    │
│  │  │ (React   │  │ Provider │  │ Provider │  │ (Registry +  ││    │
│  │  │  Router) │  │ (Light/  │  │ (Global  │  │  State)      ││    │
│  │  │          │  │  Dark)   │  │  Toggle) │  │              ││    │
│  │  └────┬─────┘  └──────────┘  └──────────┘  └──────┬───────┘│    │
│  │       │                                             │        │    │
│  │  ┌────▼─────────────────────────────────────────────▼──────┐ │    │
│  │  │                    Pages                                 │ │    │
│  │  │  HomePage  │  GamePage  │  FavoritesPage  │  SettingsPage│ │    │
│  │  └────────────────────────┬────────────────────────────────┘ │    │
│  │                           │                                   │    │
│  │  ┌────────────────────────▼────────────────────────────────┐ │    │
│  │  │               GameContainer (Bridge)                     │ │    │
│  │  │   ┌─────────────┬──────────────┬──────────────────┐     │ │    │
│  │  │   │  Canvas      │  Kaboom       │  Phaser          │     │ │    │
│  │  │   │  Games       │  Games        │  Games           │     │ │    │
│  │  │   │  (Snake,     │  (Flappy,     │  (Chess,         │     │ │    │
│  │  │   │   2048,      │   Breakout,   │   Platformer,    │     │ │    │
│  │  │   │   Sudoku)    │   Dino)       │   SpaceInvaders) │     │ │    │
│  │  │   └─────────────┴──────────────┴──────────────────┘     │ │    │
│  │  └─────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Shared Services     │  │         Native Bridge                 │ │
│  │  ┌────────────────┐  │  │  ┌────────────────┬─────────────────┐│ │
│  │  │ IndexedDB      │  │  │  │  Tauri v2 API  │ Capacitor API   ││ │
│  │  │ (High Scores,  │  │  │  │  (Window Mgmt, │ (Back Button,   ││ │
│  │  │  Favorites,    │  │  │  │   FS Access,   │  Haptics,       ││ │
│  │  │  Settings)     │  │  │  │   Auto-update) │  Status Bar)    ││ │
│  │  └────────────────┘  │  │  └────────────────┴─────────────────┘│ │
│  │  ┌────────────────┐  │  └──────────────────────────────────────┘ │
│  │  │ Service Worker │  │                                            │
│  │  │ (Cache Mgmt,   │  │                                            │
│  │  │  Offline)      │  │                                            │
│  │  └────────────────┘  │                                            │
│  └──────────────────────┘                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 React Shell ↔ Game Engine Integration

The integration between the React shell and game engines follows a strict layered architecture. No layer may skip a level — the React shell talks only to `GameContainer`, which talks only to `GameInterface`, which wraps the engine-specific code.

**Layer 1 — React Shell:** Manages routing, global state (theme, sound), and the game catalog. Knows nothing about Canvas, Kaboom, or Phaser APIs.

**Layer 2 — GameContainer:** The bridge component. Handles mount/unmount lifecycle, passes callbacks down, manages the DOM container. Knows about `GameInterface` but not about engine internals.

**Layer 3 — GameInterface Implementation:** Each game's `index.ts` implements the interface and wraps engine-specific code. This is where the engine is actually imported and used. The `mount()` function creates engine resources, and `destroy()` tears them down.

**Layer 4 — Game Engine:** Kaboom, Phaser, or raw Canvas. Completely encapsulated within Layer 3.

### 5.3 Platform Abstraction Layer

PlayBox runs in three environments: web browser, Tauri window, and Capacitor WebView. The platform abstraction layer ensures game code never needs to know which environment it's running in:

```typescript
// src/lib/platform.ts

export type Platform = 'web' | 'tauri' | 'capacitor';

let cachedPlatform: Platform | null = null;

export function detectPlatform(): Platform {
  if (cachedPlatform) return cachedPlatform;

  // Tauri v2 injects __TAURI_INTERNALS__ on the window
  if ('__TAURI_INTERNALS__' in window) {
    cachedPlatform = 'tauri';
    return 'tauri';
  }

  // Capacitor injects Capacitor on the window
  if ('Capacitor' in window) {
    cachedPlatform = 'capacitor';
    return 'capacitor';
  }

  cachedPlatform = 'web';
  return 'web';
}

/** Get the appropriate base path for assets */
export function getBasePath(): string {
  const platform = detectPlatform();
  if (platform === 'tauri' || platform === 'capacitor') {
    return './'; // Local file system
  }
  return '/playbox/'; // GitHub Pages subdirectory
}

/** Handle back button — platform-specific */
export function handleBackButton(callback: () => void): () => void {
  const platform = detectPlatform();

  if (platform === 'capacitor') {
    // Use Capacitor's BackButton plugin
    import('@capacitor/app').then(({ App }) => {
      App.addListener('backButton', callback);
    });
    return () => { /* cleanup */ };
  }

  if (platform === 'tauri') {
    // Tauri doesn't have a hardware back button, but handle Escape
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') callback();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }

  // Web: browser back button
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}
```

### 5.4 Tauri v2 Integration Details

Tauri v2 wraps the PlayBox web build in a native Windows application. The integration is primarily at the build level — Tauri serves the same `dist/` output that the web build produces. However, there are a few native enhancements:

1. **Auto-update:** Tauri v2's updater can check for new releases on GitHub and prompt the user to update. This is configured in `tauri.conf.json` and uses GitHub Releases as the update endpoint.

2. **Window management:** The shell can use `@tauri-apps/api/window` to control the native window — for example, toggling fullscreen for immersive gameplay:

```typescript
// src/hooks/useFullscreen.ts (Tauri path)

import { detectPlatform } from '../lib/platform';

export function useFullscreen() {
  const requestFullscreen = async () => {
    const platform = detectPlatform();

    if (platform === 'tauri') {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().setFullscreen(true);
    } else {
      // Fallback to Fullscreen API for web and Capacitor
      await document.documentElement.requestFullscreen();
    }
  };

  const exitFullscreen = async () => {
    const platform = detectPlatform();

    if (platform === 'tauri') {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().setFullscreen(false);
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  return { requestFullscreen, exitFullscreen };
}
```

3. **File system access (future):** For features like exporting/importing high scores, Tauri provides `@tauri-apps/api/fs` which gives sandboxed file system access not available on the web.

### 5.5 Capacitor Integration Details

Capacitor wraps the PlayBox web build in an Android WebView. The key integration points:

1. **Android back button:** Must be intercepted to navigate within the app rather than exiting:

```typescript
// In App.tsx
import { useEffect } from 'react';
import { detectPlatform, handleBackButton } from './lib/platform';

export function App() {
  useEffect(() => {
    if (detectPlatform() === 'capacitor') {
      return handleBackButton(() => {
        // If we're in a game, go back to catalog
        // If we're in catalog, minimize app (or do nothing)
        if (window.location.pathname !== '/') {
          window.history.back();
        }
      });
    }
  }, []);
  // ...
}
```

2. **Status bar and navigation:** Capacitor's `@capacitor/status-bar` plugin can set the status bar color to match the PlayBox theme.

3. **Splash screen:** Configured in `capacitor.config.ts` to show a branded splash while the WebView loads.

### 5.6 Data Flow Diagram — Playing a Game

```
User clicks "Snake" on HomePage
        │
        ▼
React Router navigates to /game/snake
        │
        ▼
GamePage component renders
        │
        ▼
gameLoaders['snake']() called (dynamic import)
        │
        ▼
Vite loads snake chunk (tiny — Canvas, no engine)
        │
        ▼
GameContainer receives GameInterface
        │
        ▼
GameContainer calls game.mount(container, callbacks, options)
        │
        ├──▶ Snake creates <canvas>, starts game loop
        │
        │    User plays snake...
        │
        ├──▶ Snake calls callbacks.onScore(150)
        │         │
        │         ▼
        │    GameContainer updates score display
        │
        ├──▶ Snake calls callbacks.onGameOver(150)
        │         │
        │         ▼
        │    GameContainer shows game-over overlay
        │         │
        │         ▼
        │    useHighScore hook persists score to IndexedDB
        │
        │    User clicks "Back"
        │         │
        │         ▼
        │    GameContainer calls instance.destroy()
        │         │
        │         ▼
        │    Snake cancels animation frame, removes listeners
        │
        ▼
React Router navigates back to /
```

---

## 6. PWA Architecture

### 6.1 Strategy Overview

PlayBox must work fully offline as a PWA. With 50+ games, each potentially requiring different engine code and asset files, the caching strategy is critical. We adopt a **hybrid cache-on-demand with strategic precaching** approach:

- **Precache (on install):** The shell, game catalog metadata, and thumbnails. This ensures the home page loads instantly offline.
- **Cache on play (on demand):** Game code chunks, engine chunks, and game assets. These are cached when the user actually plays a game.
- **Cache on browse:** Game thumbnails and category icons are cached as the user scrolls the catalog.

This hybrid approach means the initial service worker install is fast (< 5 MB), and the cache grows organically as the user engages with games. A user who only plays 5 games will only cache those 5 games' resources.

### 6.2 Service Worker Configuration

We use `vite-plugin-pwa` with Workbox under the hood:

```typescript
// In vite.config.ts, VitePWA plugin config

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt'],

  workbox: {
    // Maximum cache size — prune oldest entries beyond this
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB per file

    // Precache only the shell — game chunks are cached on demand
    globPatterns: [
      '**/*.{js,css,html,ico,png,svg,woff2}',
    ],

    // Exclude game chunks from precaching — they're too large
    globIgnores: [
      '**/engine-phaser.*.js',
      '**/engine-kaboom.*.js',
      '**/games/**/*.js',
      '**/games/**/*.png',
    ],

    // Runtime caching strategies
    runtimeCaching: [
      // Game code chunks — cache first, then network
      {
        urlPattern: /\/assets\/games\/.*\.js$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'game-code',
          expiration: {
            maxEntries: 60,        // Up to 60 games cached
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },

      // Engine chunks (Phaser, Kaboom) — cache first, long TTL
      {
        urlPattern: /\/assets\/engine-.*\.js$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'game-engines',
          expiration: {
            maxEntries: 3,         // Only 3 engines (canvas, kaboom, phaser)
            maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },

      // Game static assets (sprites, audio) — cache first
      {
        urlPattern: /\/games\/.*\.(png|jpg|webp|svg|mp3|ogg|wav)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'game-assets',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },

      // Thumbnails and UI images — stale while revalidate
      {
        urlPattern: /\/icons\/.*\.(png|svg)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'ui-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },

      // Google Fonts (if used) — cache first
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
})
```

### 6.3 Manifest Configuration

```json
// public/manifest.json
{
  "name": "PlayBox — Game Station",
  "short_name": "PlayBox",
  "description": "50+ casual games in your pocket. Play offline, anytime.",
  "start_url": "/playbox/",
  "scope": "/playbox/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#6C63FF",
  "background_color": "#FFF8F0",
  "categories": ["games", "entertainment"],
  "icons": [
    {
      "src": "/playbox/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/playbox/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/playbox/icons/maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/playbox/screenshots/home-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/playbox/screenshots/home-narrow.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

Key manifest decisions:
- **`display: "standalone"`** — No browser chrome. PlayBox should feel like a native app, not a website.
- **`orientation: "any"`** — Some games work better in portrait (Flappy Bird), others in landscape (racing). Let the game handle orientation.
- **`background_color: "#FFF8F0"`** — Warm off-white matching the kid-friendly design system. This color shows during the splash screen before the app loads.
- **`theme_color: "#6C63FF"`** — PlayBox's brand purple, used for the OS task switcher and title bar.

### 6.4 Offline Data Persistence

Game state that must persist offline uses IndexedDB (for structured data) and localStorage (for simple key-value settings):

```typescript
// src/lib/storage.ts

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'playbox';
const DB_VERSION = 1;

interface PlayBoxDB {
  highScores: {
    key: string; // gameId:difficulty
    value: { score: number; date: string };
  };
  favorites: {
    key: string; // gameId
    value: { addedAt: string };
  };
  gameSettings: {
    key: string; // gameId
    value: Record<string, unknown>;
  };
}

let dbPromise: Promise<IDBPDatabase<PlayBoxDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PlayBoxDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('highScores');
        db.createObjectStore('favorites');
        db.createObjectStore('gameSettings');
      },
    });
  }
  return dbPromise;
}

// High scores
export async function getHighScore(gameId: string, difficulty: string): Promise<number | null> {
  const db = await getDB();
  const entry = await db.get('highScores', `${gameId}:${difficulty}`);
  return entry?.score ?? null;
}

export async function setHighScore(gameId: string, difficulty: string, score: number): Promise<void> {
  const db = await getDB();
  await db.put('highScores', { score, date: new Date().toISOString() }, `${gameId}:${difficulty}`);
}

// Favorites
export async function getFavorites(): Promise<string[]> {
  const db = await getDB();
  return db.getAllKeys('favorites');
}

export async function toggleFavorite(gameId: string): Promise<boolean> {
  const db = await getDB();
  const existing = await db.get('favorites', gameId);
  if (existing) {
    await db.delete('favorites', gameId);
    return false;
  } else {
    await db.put('favorites', { addedAt: new Date().toISOString() }, gameId);
    return true;
  }
}

// Settings (simple — localStorage is fine for non-sensitive preferences)
export function getSetting<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(`playbox:${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setSetting<T>(key: string, value: T): void {
  localStorage.setItem(`playbox:${key}`, JSON.stringify(value));
}
```

### 6.5 Offline Fallback Page

If the service worker intercepts a navigation request while offline and the page isn't cached, we serve a custom offline fallback:

```typescript
// Additional workbox config in vite.config.ts

workbox: {
  // ... (other config)

  navigateFallback: '/index.html', // SPA fallback — React Router handles 404s
  navigateFallbackDenylist: [/^\/games\/.*\.(png|jpg|mp3|ogg)$/], // Don't intercept asset requests
}
```

Since PlayBox is a SPA, all navigation falls back to `index.html`, and React Router handles the routing client-side. As long as the shell HTML + JS is precached, the entire catalog and any previously-played games will work offline.

### 6.6 Storage Budget Planning

Estimated cache sizes for PWA:

| Cache Category | Size per Entry | Entries | Total |
|---------------|---------------|---------|-------|
| Shell (HTML + JS + CSS) | ~120 KB | 1 | ~120 KB |
| Game thumbnails | ~5 KB | 50 | ~250 KB |
| Canvas game chunks | ~8 KB | 25 | ~200 KB |
| Kaboom engine chunk | ~40 KB | 1 | ~40 KB |
| Kaboom game chunks | ~5 KB | 15 | ~75 KB |
| Phaser engine chunk | ~350 KB | 1 | ~350 KB |
| Phaser game chunks | ~15 KB | 10 | ~150 KB |
| Game assets (average) | ~50 KB | 50 | ~2.5 MB |
| **Full cache (all games)** | | | **~3.7 MB** |
| **Typical user (10 games)** | | | **~800 KB** |

This is well within browser PWA storage quotas (typically 50 MB+ on modern browsers) and within the Chrome storage pressure threshold.

---

## 7. Risk Assessment

### Risk 1: Phaser Bundle Size Degrades Initial Load

**Severity:** High  
**Likelihood:** Medium  
**Impact:** Users on slow connections may experience a 350 KB download the first time they play a Phaser game. If they bounce to a Phaser game quickly, the load time could be several seconds on 3G.

**Mitigation:**
- Phaser is already isolated in its own chunk via `manualChunks` in Vite config — it never loads unless a Phaser game is played.
- Add a "loading engine..." progress indicator when a Phaser game is first loaded. Show a fun animation (the PlayBox mascot juggling) to keep the user engaged during the download.
- Preload the Phaser chunk opportunistically: when the user has been browsing the catalog for > 10 seconds and WiFi is detected, silently preload the engine chunk in the background using `<link rel="preload">` or a low-priority `import()`.
- Compress assets with Brotli on the server (GitHub Pages supports this) to reduce the effective transfer size from 350 KB to ~100 KB.
- Consider migrating Phaser-heavy games to a lighter alternative in the future if Phaser's size becomes a persistent issue.

### Risk 2: Kaboom.js Global State Pollution

**Severity:** High  
**Likelihood:** High  
**Impact:** Kaboom.js (especially versions < 3000) uses a global context. If two Kaboom games are mounted simultaneously (shouldn't happen, but bugs happen), or if a Kaboom game isn't properly cleaned up, the global state can corrupt the next game's rendering.

**Mitigation:**
- **Primary defense:** The `GameContainer` component's `useEffect` cleanup guarantees `destroy()` is called before any new game mounts. React's strict mode in development will catch cleanup bugs early.
- **Kaboom v3000+ scoped context:** Always use the latest Kaboom version which supports scoped instances (`kaboom({ canvas })` returns an isolated context). Never use the global `kaboom()` without a canvas argument.
- **GameContainer enforces singleton:** Add a runtime guard in `GameContainer` that throws if `mount()` is called while another game is still mounted.
- **Integration test:** Write an E2E test that plays 10 different Kaboom games in sequence without page reload, checking for state leakage after each game.
- **Nuclear cleanup:** In the `destroy()` method of every Kaboom game, explicitly call `k.quit()` and remove the canvas element from the DOM. Null out all references to Kaboom objects.

### Risk 3: PWA Cache Invalidation and Game Updates

**Severity:** Medium  
**Likelihood:** High  
**Impact:** When a game is updated (bug fix, new features), users who have the old version cached in the service worker may not see the update for days. The "StaleWhileRevalidate" and "CacheFirst" strategies mean stale game code can persist.

**Mitigation:**
- Vite's content-hash filenames (`game-snake-AbCd1234.js`) ensure that when game code changes, the filename changes, which means the service worker treats it as a new resource. The old chunk becomes orphaned and is cleaned up by Workbox's expiration plugin.
- The `vite-plugin-pwa` `autoUpdate` registration type forces the new service worker to activate immediately (skipping the waiting state) and reloads the page. This means updates are applied on the next navigation.
- For critical bug fixes, add a version check mechanism: the shell can fetch a small JSON file (`/version.json`) on startup and compare with the cached version. If different, show a "Update available — refresh" banner.
- Set reasonable `maxAgeSeconds` in runtime caching: 30 days for game code is a good balance between offline capability and update freshness.
- Document the update flow for contributors: "To force users to get a game update, change the game's `version` field in `GameMeta`."

### Risk 4: Android WebView Performance and Compatibility

**Severity:** Medium  
**Likelihood:** Medium  
**Impact:** Capacitor uses the Android System WebView, which can be significantly slower than Chrome on the same device. Phaser 3 games with many sprites may drop frames. Older Android devices (WebView < v90) may lack WebGL2 support needed by Phaser.

**Mitigation:**
- **Performance budget per game:** Define a target of 30 FPS minimum on a mid-range Android device (e.g., Samsung Galaxy A13). Games that can't meet this should be marked as "desktop recommended" in their metadata.
- **Canvas.AUTO renderer in Phaser:** Configure Phaser to use Canvas2D fallback when WebGL is unavailable or slow. This sacrifices some visual fidelity for compatibility:
  ```typescript
  new Phaser.Game({
    type: Phaser.AUTO, // Tries WebGL, falls back to Canvas
    // ...
  });
  ```
- **Capacitor WebView plugin:** Consider using `@nicklason/capacitor-webview` or configuring the Android WebView to enable hardware acceleration and JavaScript JIT compilation.
- **Device capability detection:** Before mounting a Phaser game, check `navigator.hardwareConcurrency` and WebGL support. If insufficient, show a warning: "This game may run slowly on your device."
- **Test matrix:** Maintain a small collection of physical Android devices for testing (low-end, mid-range, flagship). Run automated performance benchmarks with each release.

### Risk 5: Contributor Onboarding Friction for 50+ Games

**Severity:** Medium  
**Likelihood:** High  
**Impact:** As the game catalog grows, new contributors must understand the `GameInterface` contract, the engine conventions, the asset placement rules, and the registry generation process. Without good tooling, the barrier to adding a game will be high, and game quality will be inconsistent.

**Mitigation:**
- **Game scaffolding CLI:** Create a `pnpm create-game <name> --engine <canvas|kaboom|phaser>` command that generates the complete game directory structure with a working starter template:
  ```
  src/games/my-game/
  ├── index.ts         # Pre-filled GameInterface implementation
  ├── MyGame.tsx       # Starter component with TODO comments
  └── assets/          # Empty directory for game assets
  ```
- **Automated interface validation:** The `pnpm check-games` script (referenced in build pipeline) must validate:
  - Every directory in `src/games/` has an `index.ts` that exports a default `GameInterface`
  - All required `GameMeta` fields are present and correctly typed
  - The `mount()` function signature matches the contract
  - Thumbnail images exist at the declared paths
  This script runs in CI and blocks merging if any game is non-compliant.
- **Game development mode:** Add a `?game=snake` query parameter that loads the PlayBox shell in "game dev" mode — it loads only the specified game, skips the catalog, and shows debug overlays (FPS counter, mount/unmount events, etc.).
- **Documentation site:** A `CONTRIBUTING.md` with step-by-step game creation guides for each engine tier, complete with copy-paste starter code and common patterns.
- **Code review template:** A PR template that includes a checklist for game submissions: "Does it implement GameInterface? Does it clean up on destroy()? Does it handle pause/resume? Are assets under 1 MB total?"

---

## Appendix A: Game Registry Generator Script

```typescript
// scripts/generate-game-registry.ts

import * as fs from 'fs';
import * as path from 'path';

const GAMES_DIR = path.resolve(__dirname, '../src/games');
const OUTPUT_FILE = path.resolve(__dirname, '../src/game-registry.generated.ts');

interface GameDir {
  id: string;
  hasIndex: boolean;
}

function scanGames(): GameDir[] {
  const entries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => ({
      id: dir.name,
      hasIndex: fs.existsSync(path.join(GAMES_DIR, dir.name, 'index.ts')),
    }))
    .filter((game) => game.hasIndex);
}

function generateRegistry(games: GameDir[]): string {
  const loaderEntries = games.map((game) => {
    // Convert kebab-case directory name to PascalCase export name
    const exportName = game.id
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Game';

    return `  '${game.id}': () => import('../games/${game.id}/index').then(m => ({ default: m.${exportName} })),`;
  });

  const metaEntries = games.map((game) => {
    const exportName = game.id
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Game';

    return `  '${game.id}': (await import('../games/${game.id}/index')).${exportName}.meta,`;
  });

  return `// AUTO-GENERATED by scripts/generate-game-registry.ts
// Do not edit manually — run "pnpm generate-registry" to regenerate

import type { GameMeta } from '../types/game';

export type GameLoader = () => Promise<{ default: import('../types/game').GameInterface }>;

export const gameLoaders: Record<string, GameLoader> = {
${loaderEntries.join('\n')}
};

// Async metadata loader — loads only meta, not engine code
const _metaCache: Record<string, GameMeta> = {};

export async function getGameMeta(gameId: string): Promise<GameMeta | undefined> {
  if (_metaCache[gameId]) return _metaCache[gameId];
  const loader = gameLoaders[gameId];
  if (!loader) return undefined;
  const mod = await loader();
  _metaCache[gameId] = mod.default.meta;
  return _metaCache[gameId];
}

// Static list of available game IDs
export const gameIds: string[] = [
${games.map((g) => `  '${g.id}',`).join('\n')}
];
`;
}

// Main
const games = scanGames();
const output = generateRegistry(games);
fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
console.log(`Generated registry with ${games.length} games: ${games.map((g) => g.id).join(', ')}`);
```

## Appendix B: Tailwind Configuration for PlayBox Design System

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PlayBox brand palette — joyful, kid-friendly
        brand: {
          50: '#F0EDFF',
          100: '#DDD6FE',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#6C63FF', // Primary brand color
          600: '#5B4FE0',
          700: '#4A3CC1',
          800: '#3A2DA1',
          900: '#2B1F82',
        },
        warm: {
          50: '#FFF8F0',
          100: '#FFEED9',
          200: '#FFDDB3',
          300: '#FFCC8C',
          400: '#FFBB66',
          500: '#FFAA40',
        },
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
      },
      fontFamily: {
        display: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        game: ['Press Start 2P', 'monospace'],
      },
      borderRadius: {
        'game': '1rem',
        'card': '1.25rem',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pop': 'pop 0.3s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

*End of PlayBox Architecture Report. This document should be revisited and updated at each major milestone (MVP, v0.5, v1.0.0).*
