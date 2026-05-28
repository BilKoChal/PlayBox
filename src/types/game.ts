/**
 * PlayBox — Canonical Game Interface
 *
 * This is the contract that EVERY game must implement.
 * The platform shell (GameWrapper) controls games through this interface.
 * Games are black boxes — the shell never accesses internals.
 *
 * See: docs/reports/PlayBox_game_engine_report.md
 */

// ============================================
// Game Categories
// ============================================

/**
 * All 8 game categories in PlayBox.
 * Each category has a display color and emoji for UI rendering.
 */
export enum GameCategory {
  LogicPuzzle = 'logic-puzzle',
  Arcade = 'arcade',
  Board = 'board',
  Card = 'card',
  Strategy = 'strategy',
  Action = 'action',
  Sports = 'sports',
  Casual = 'casual',
}

/** Category metadata for UI rendering */
export interface CategoryInfo {
  id: GameCategory;
  label: string;
  emoji: string;
  color: string;       // Tailwind color class
  bgColor: string;     // Tailwind background class
}

/** Complete category registry */
export const CATEGORIES: Record<GameCategory, CategoryInfo> = {
  [GameCategory.LogicPuzzle]: {
    id: GameCategory.LogicPuzzle,
    label: 'Logic & Puzzle',
    emoji: '🧩',
    color: 'text-accent-purple',
    bgColor: 'bg-accent-purple/15',
  },
  [GameCategory.Arcade]: {
    id: GameCategory.Arcade,
    label: 'Arcade',
    emoji: '👾',
    color: 'text-accent-orange',
    bgColor: 'bg-accent-orange/15',
  },
  [GameCategory.Board]: {
    id: GameCategory.Board,
    label: 'Board',
    emoji: '🎲',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/15',
  },
  [GameCategory.Card]: {
    id: GameCategory.Card,
    label: 'Card',
    emoji: '🃏',
    color: 'text-accent-red',
    bgColor: 'bg-accent-red/15',
  },
  [GameCategory.Strategy]: {
    id: GameCategory.Strategy,
    label: 'Strategy',
    emoji: '♟️',
    color: 'text-secondary',
    bgColor: 'bg-secondary/15',
  },
  [GameCategory.Action]: {
    id: GameCategory.Action,
    label: 'Action',
    emoji: '⚡',
    color: 'text-primary-dark',
    bgColor: 'bg-primary/15',
  },
  [GameCategory.Sports]: {
    id: GameCategory.Sports,
    label: 'Sports',
    emoji: '⚽',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/15',
  },
  [GameCategory.Casual]: {
    id: GameCategory.Casual,
    label: 'Casual',
    emoji: '🎈',
    color: 'text-accent-pink',
    bgColor: 'bg-accent-pink/15',
  },
};

// ============================================
// Difficulty Levels
// ============================================

/**
 * Three difficulty tiers per game.
 * Each game defines what changes between difficulties
 * (e.g., speed, grid size, AI strength, timer).
 */
export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

/** Difficulty display metadata */
export interface DifficultyInfo {
  id: Difficulty;
  label: string;
  emoji: string;
  stars: number; // 1–3
}

export const DIFFICULTIES: Record<Difficulty, DifficultyInfo> = {
  [Difficulty.Easy]: { id: Difficulty.Easy, label: 'Easy', emoji: '🌱', stars: 1 },
  [Difficulty.Medium]: { id: Difficulty.Medium, label: 'Medium', emoji: '🔥', stars: 2 },
  [Difficulty.Hard]: { id: Difficulty.Hard, label: 'Hard', emoji: '🏔️', stars: 3 },
};

// ============================================
// Engine Types
// ============================================

/**
 * Which engine tier the game uses.
 * Determines code-split chunk and loading behavior.
 */
export enum EngineType {
  Canvas = 'canvas',     // Plain Canvas 2D — zero overhead
  Kaboom = 'kaboom',     // Kaboom.js — ~40KB shared chunk
  Phaser = 'phaser',     // Phaser 3 — ~350KB shared chunk
}

// ============================================
// Game Metadata
// ============================================

/**
 * Static metadata for a game.
 * This is loaded BEFORE the game code — used in catalogs, search, cards.
 * Must be serializable (no functions, no class instances).
 */
export interface GameMetadata {
  /** Unique kebab-case identifier (e.g., "snake", "tic-tac-toe") */
  readonly id: string;

  /** Human-readable game name (e.g., "Snake", "Tic-Tac-Toe") */
  readonly name: string;

  /** Short description for game card (max 80 chars) */
  readonly description: string;

  /** Longer description for game page (1–2 sentences) */
  readonly longDescription?: string;

  /** Game category */
  readonly category: GameCategory;

  /** Engine tier */
  readonly engine: EngineType;

  /** Available difficulties */
  readonly difficulties: Difficulty[];

  /** Default difficulty */
  readonly defaultDifficulty: Difficulty;

  /** Searchable tags for Fuse.js */
  readonly tags: string[];

  /** Thumbnail image path (relative to public/) */
  readonly thumbnail: string;

  /** Path to game-specific assets (relative to public/games/) */
  readonly assetsPath: string;

  /** Whether the game supports keyboard input */
  readonly supportsKeyboard: boolean;

  /** Whether the game supports touch input */
  readonly supportsTouch: boolean;

  /** Whether the game supports gamepad input */
  readonly supportsGamepad: boolean;

  /** Minimum screen width in pixels (0 = any) */
  readonly minWidth: number;

  /** Game version (semver) */
  readonly version: string;

  /** Author/credits */
  readonly author?: string;
}

// ============================================
// Mount Options (passed to game on mount)
// ============================================

/** Callbacks the game can invoke to communicate with the shell */
export interface GameCallbacks {
  /** Called when the game wants to update the displayed score */
  onScoreUpdate: (score: number) => void;

  /** Called when the game is over (final score submitted automatically) */
  onGameOver: (finalScore: number) => void;

  /** Called when the game is paused/resumed externally */
  onPause: () => void;
  onResume: () => void;

  /** Called to show a toast notification to the player */
  onToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;

  /** Called when the game wants to go back to the catalog */
  onNavigateBack: () => void;
}

/** Shared utilities injected into each game */
export interface GameUtilities {
  /** Sound manager for playing audio (Web Audio API) */
  soundManager: import('@/lib/audio').SoundManager;

  /** Score tracker for persisting scores (IndexedDB) */
  scoreTracker: import('@/lib/storage').ScoreTracker;

  /** Platform detection (web / tauri / capacitor) */
  platform: import('@/lib/platform').PlatformInfo;

  /** Fullscreen service */
  fullscreen: import('@/lib/fullscreen').FullscreenService;

  /** Current difficulty level */
  difficulty: Difficulty;

  /** Difficulty-specific parameters (game-defined) */
  difficultyParams: Record<string, unknown>;
}

/** Options passed to game.mount() */
export interface MountOptions {
  /** The HTML container element the game should render into */
  container: HTMLElement;

  /** Current difficulty level */
  difficulty: Difficulty;

  /** Callbacks for shell ← game communication */
  callbacks: GameCallbacks;

  /** Injected shared utilities */
  utilities: GameUtilities;

  /** Initial canvas/container width */
  width: number;

  /** Initial canvas/container height */
  height: number;

  /** Whether the device prefers reduced motion */
  prefersReducedMotion: boolean;
}

// ============================================
// PlayBoxGame Interface (THE Contract)
// ============================================

/**
 * The canonical PlayBox game interface.
 *
 * Every game MUST implement this interface and export it as the default export.
 * The platform shell (GameWrapper) uses this interface to control the game lifecycle.
 *
 * Usage in a game file (src/games/snake/index.ts):
 * ```
 * import { PlayBoxGame, GameMetadata, ... } from '@/types/game';
 *
 * const metadata: GameMetadata = { ... };
 *
 * const game: PlayBoxGame = {
 *   metadata,
 *   mount(options) { ... },
 *   unmount() { ... },
 * };
 *
 * export default game;
 * ```
 */
export interface PlayBoxGame {
  /** Static game metadata — available without loading game code */
  readonly metadata: GameMetadata;

  /**
   * Initialize and start the game.
   * Called when the user navigates to the game page.
   *
   * The game should:
   * 1. Create its canvas/element and append to container
   * 2. Initialize its engine (Kaboom, Phaser, or raw Canvas)
   * 3. Start the game loop
   * 4. Set up input handlers
   * 5. Register sound effects via utilities.soundManager
   *
   * Must return void (not a promise) for simplicity.
   */
  mount(options: MountOptions): void;

  /**
   * Clean up and destroy the game.
   * Called when the user navigates away from the game page.
   *
   * The game MUST:
   * 1. Stop all animation loops (cancelAnimationFrame)
   * 2. Destroy engine instances (Phaser: game.destroy(true), Kaboom: navigate to cleanup scene + null context)
   * 3. Remove all event listeners
   * 4. Clear the container innerHTML
   * 5. Unregister sounds from utilities.soundManager
   *
   * After unmount, the container should be empty and no game resources should remain in memory.
   */
  unmount(): void;

  /**
   * Pause the game (optional).
   * Called when the user opens settings, switches tabs, or the app goes to background.
   * Should freeze game state but not destroy it.
   */
  pause?(): void;

  /**
   * Resume the game (optional).
   * Called after pause() when the user returns to the game.
   * Should unfreeze game state and resume the game loop.
   */
  resume?(): void;
}

// ============================================
// Game Registry Entry (auto-generated)
// ============================================

/**
 * Entry in the auto-generated game registry.
 * Contains metadata (always loaded) and a lazy import function (loaded on demand).
 */
export interface GameRegistryEntry {
  /** Game metadata — loaded immediately for catalog display */
  metadata: GameMetadata;

  /** Lazy import function — loads game code + engine chunk on demand */
  load: () => Promise<{ default: PlayBoxGame }>;
}

/**
 * Type for the auto-generated game registry.
 * Maps game IDs to their registry entries.
 */
export type GameRegistry = Record<string, GameRegistryEntry>;
