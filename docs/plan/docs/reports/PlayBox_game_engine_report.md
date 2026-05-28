# PlayBox Game Engine Integration Report

**Author:** Game Engine Integration Specialist  
**Date:** 2026-03-04  
**Project:** PlayBox — Web-Based Game Station Platform  
**Stack:** React 18 + Vite + TypeScript (single flat repo)

---

## Table of Contents

1. [Game Interface Contract](#1-game-interface-contract)
2. [Plain Canvas Game Integration](#2-plain-canvas-game-integration)
3. [Kaboom.js Game Integration](#3-kaboomjs-game-integration)
4. [Phaser 3 Game Integration](#4-phaser-3-game-integration)
5. [Lazy Loading Strategy](#5-lazy-loading-strategy)
6. [Memory Management](#6-memory-management)
7. [Shared Game Utilities](#7-shared-game-utilities)
8. [Testing Game Integration](#8-testing-game-integration)

---

## 1. Game Interface Contract

The single most critical piece of architecture in PlayBox is the contract between the React shell and every game. Every game — regardless of engine — must implement the same TypeScript interface. This ensures the shell can mount, unmount, pause, resume, and query metadata for any game without knowing its internals. The interface is the seam that decouples the platform from the game implementations.

### Design Principles

- **Container-based mounting:** The shell owns a `<div>` and passes it to the game. The game is responsible for creating its own canvas (or letting the engine create one) inside that container. The game never touches the DOM outside its container.
- **Explicit lifecycle:** `mount` and `unmount` are the two hard requirements. `pause` and `resume` are soft requirements — the shell may call them when the user switches tabs or opens a modal, and games should implement them for a good UX, but a game that ignores them will still function.
- **Metadata is static:** The `metadata` property is a read-only object that the shell reads at registration time (before mounting) to build the game catalog, thumbnails, and filter UI. It must never change at runtime.
- **No React dependency:** The game interface is a plain TypeScript object. Games must not import React or depend on React lifecycle hooks. The shell's `GameWrapper` React component is the adapter that bridges React's lifecycle to the game's `mount`/`unmount` calls.

### Full Interface Definition

```typescript
// src/types/game.ts

/**
 * Difficulty level for a game. Games may support one or more.
 * The shell uses this for filtering and for displaying difficulty selectors.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Category for a game. Used by the shell for the game catalog and filtering.
 * Each game belongs to exactly one primary category.
 */
export type GameCategory =
  | 'logic'       // Chess, Sudoku, 2048, Tic-Tac-Toe
  | 'arcade'      // Snake, Flappy Bird, Pong, Space Invaders
  | 'platformer'  // Side-scrollers
  | 'puzzle'      // Tetris, Match-3
  | 'card'        // Solitaire, Poker
  | 'sports'      // Mini golf, Bowling
  | 'racing'      // Top-down racers
  | 'strategy';   // Tower defense

/**
 * Engine type used by this game. The shell uses this to decide
 * which shared utilities to inject and how to handle mounting.
 */
export type EngineType = 'canvas' | 'kaboom' | 'phaser';

/**
 * Static metadata about a game. This is read once at registration time
 * and must not change during the game's lifetime.
 */
export interface GameMetadata {
  /** Unique identifier for this game, e.g. "tic-tac-toe" */
  id: string;

  /** Human-readable display name, e.g. "Tic-Tac-Toe" */
  name: string;

  /** Short description for the game card (max 120 chars) */
  description: string;

  /** Category for filtering */
  category: GameCategory;

  /** Which rendering engine this game uses */
  engine: EngineType;

  /** Path to the thumbnail image, e.g. "/assets/thumbnails/tic-tac-toe.webp" */
  thumbnail: string;

  /** Difficulty levels this game supports */
  difficulties: Difficulty[];

  /** Default difficulty when the user hasn't selected one */
  defaultDifficulty: Difficulty;

  /** Whether this game has sound effects or music */
  hasSound: boolean;

  /** Minimum canvas/container width in CSS pixels (default: 320) */
  minWidth?: number;

  /** Minimum canvas/container height in CSS pixels (default: 480) */
  minHeight?: number;

  /** Aspect ratio hint for the shell's layout engine, e.g. 4/3 */
  aspectRatio?: number;

  /** Version string for cache-busting and update tracking */
  version: string;
}

/**
 * Options passed to mount() so the game can configure itself
 * before rendering begins.
 */
export interface MountOptions {
  /** The difficulty level selected by the user */
  difficulty: Difficulty;

  /** Whether to start with sound enabled */
  soundEnabled: boolean;

  /** Callback for the game to report its score to the shell */
  onScoreUpdate: (score: number) => void;

  /** Callback for the game to report that it has ended */
  onGameEnd: (finalScore: number) => void;

  /** Callback for the game to report an error to the shell */
  onError: (error: Error) => void;

  /** Callback for the game to request the shell show a toast/notification */
  onNotify: (message: string) => void;

  /** Access to shared game utilities (sound manager, input, etc.) */
  utilities: GameUtilities;
}

/**
 * The core interface every PlayBox game must implement.
 *
 * Lifecycle:
 *   1. Shell reads `metadata` to build catalog
 *   2. User selects game → Shell creates a container div
 *   3. Shell calls `mount(container, options)`
 *   4. Game renders into container
 *   5. Shell may call `pause()` / `resume()` during play
 *   6. Shell calls `unmount()` when user navigates away
 *
 * After unmount(), the game instance should be eligible for GC.
 * A new instance will be created if the user plays again.
 */
export interface PlayBoxGame {
  /** Static metadata — must be available before mount() is called */
  readonly metadata: GameMetadata;

  /**
   * Mount the game into the given container element.
   * This is called exactly once per game instance.
   * The game must create its canvas/scene inside this container.
   *
   * @param container - A div element owned by the React shell.
   * @param options - Configuration and callbacks for this session.
   */
  mount(container: HTMLElement, options: MountOptions): void;

  /**
   * Unmount the game and release all resources.
   * Called exactly once, when the user navigates away.
   * Must:
   *   - Cancel all animation frames
   *   - Destroy engine instances (Phaser.Game, Kaboom context)
   *   - Remove all event listeners
   *   - Clear the container's innerHTML
   * After this call, the game instance should be GC-eligible.
   */
  unmount(): void;

  /**
   * Pause the game loop. Called when:
   *   - User opens the pause menu
   *   - Browser tab becomes hidden
   *   - Shell overlay appears
   * Should freeze game state but keep the rendered frame visible.
   * Optional: games that don't implement this will simply continue running.
   */
  pause?(): void;

  /**
   * Resume the game loop after a pause().
   * Should restore the game to exactly the state it was in when paused.
   */
  resume?(): void;
}

/**
 * Shared utilities injected into each game via MountOptions.
 * These are provided by the shell so games don't need their own
 * implementations of common features.
 */
export interface GameUtilities {
  /** Shared sound manager (respects global mute, volume) */
  sound: SoundManager;

  /** Keyboard/gamepad input helper */
  input: InputHelper;

  /** Score persistence (local storage) */
  score: ScoreTracker;

  /** Game timer (respects pause/resume) */
  timer: GameTimer;

  /** Difficulty helper */
  difficulty: DifficultyHelper;
}
```

### The Shell-Side Adapter: `GameWrapper` Component

The React shell wraps every game in a `GameWrapper` component that bridges React's lifecycle to the `PlayBoxGame` interface:

```typescript
// src/components/GameWrapper.tsx

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PlayBoxGame, MountOptions, Difficulty } from '../types/game';
import { useGameUtilities } from '../hooks/useGameUtilities';

interface GameWrapperProps {
  gameFactory: () => PlayBoxGame;
  difficulty: Difficulty;
  soundEnabled: boolean;
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
  onBack: () => void;
}

export function GameWrapper({
  gameFactory,
  difficulty,
  soundEnabled,
  onScoreUpdate,
  onGameEnd,
  onBack,
}: GameWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PlayBoxGame | null>(null);
  const utilities = useGameUtilities();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a fresh game instance
    const game = gameFactory();
    gameRef.current = game;

    const options: MountOptions = {
      difficulty,
      soundEnabled,
      onScoreUpdate,
      onGameEnd,
      onError: (err) => console.error(`[PlayBox] Game error:`, err),
      onNotify: (msg) => console.log(`[PlayBox] Game notification:`, msg),
      utilities,
    };

    game.mount(container, options);

    // Cleanup on unmount
    return () => {
      game.unmount();
      gameRef.current = null;
    };
  }, []); // Intentionally mount once; difficulty/sound changes handled by pause/resume

  // Handle visibility changes (tab switch) → auto pause/resume
  useEffect(() => {
    const handleVisibility = () => {
      const game = gameRef.current;
      if (!game) return;
      if (document.hidden) {
        game.pause?.();
      } else {
        game.resume?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <button
          onClick={() => gameRef.current?.pause?.()}
          className="pause-button"
        >
          ⏸ Pause
        </button>
      </div>
      <div ref={containerRef} className="game-container" />
    </div>
  );
}
```

This contract is intentionally minimal. By keeping the interface small, we reduce the friction for game developers and ensure every game can be integrated in a consistent, predictable way. The shell never reaches into the game's internals — it only calls the methods defined on `PlayBoxGame`.

---

## 2. Plain Canvas Game Integration

Plain Canvas games are the simplest tier in PlayBox's engine hierarchy. They use the raw HTML5 Canvas 2D API with no framework overhead, making them ideal for logic-heavy games like Chess, Sudoku, 2048, and Tic-Tac-Toe where the rendering is simple and the complexity lies in game state and rules.

### Architecture Overview

A Plain Canvas game manages its own lifecycle entirely: it creates a `<canvas>` element, gets a `CanvasRenderingContext2D`, and drives its own render loop with `requestAnimationFrame`. The key challenge is ensuring that when the shell calls `unmount()`, every resource is released: the animation frame must be cancelled, event listeners removed, and the canvas destroyed.

### Canvas Sizing Strategy

Canvas games must handle two different size concepts:

1. **CSS size** — the visual size of the canvas on screen, responsive to container changes
2. **Buffer size** — the pixel resolution of the canvas backing store, typically scaled by `devicePixelRatio` for crisp rendering

The game must watch for container resize events and update both dimensions accordingly. We use a `ResizeObserver` for this, which is more reliable than listening to `window.resize` since it fires when the container itself changes size (e.g., when the shell's sidebar collapses).

### Complete Example: Tic-Tac-Toe

```typescript
// src/games/tic-tac-toe/index.ts

import type { PlayBoxGame, GameMetadata, MountOptions, Difficulty } from '../../types/game';

// ─── Metadata ───────────────────────────────────────────────
const metadata: GameMetadata = {
  id: 'tic-tac-toe',
  name: 'Tic-Tac-Toe',
  description: 'Classic 3×3 grid. Play against a friend or the computer.',
  category: 'logic',
  engine: 'canvas',
  thumbnail: '/assets/thumbnails/tic-tac-toe.webp',
  difficulties: ['easy', 'medium', 'hard'],
  defaultDifficulty: 'medium',
  hasSound: true,
  minWidth: 300,
  minHeight: 300,
  aspectRatio: 1,
  version: '1.0.0',
};

// ─── Types ──────────────────────────────────────────────────
type Cell = 'X' | 'O' | null;
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

interface GameState {
  board: Board;
  currentPlayer: 'X' | 'O';
  winner: Cell | 'draw';
  difficulty: Difficulty;
  aiThinking: boolean;
}

// ─── Game Implementation ────────────────────────────────────
class TicTacToeGame implements PlayBoxGame {
  readonly metadata = metadata;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private container: HTMLElement | null = null;
  private options: MountOptions | null = null;

  private state: GameState;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;
  private boundHandleClick: ((e: MouseEvent) => void) | null = null;
  private paused = false;

  // Visual sizing
  private canvasWidth = 0;
  private canvasHeight = 0;
  private cellSize = 0;
  private offsetX = 0;
  private offsetY = 0;
  private padding = 20;

  // Animation state
  private hoverCell = -1;
  private winLine: { start: number; end: number } | null = null;
  private winLineProgress = 0;

  constructor() {
    this.state = this.createInitialState('medium');
  }

  private createInitialState(difficulty: Difficulty): GameState {
    return {
      board: Array(9).fill(null) as Board,
      currentPlayer: 'X',
      winner: null,
      difficulty,
      aiThinking: false,
    };
  }

  // ─── Mount ──────────────────────────────────────────────
  mount(container: HTMLElement, options: MountOptions): void {
    this.container = container;
    this.options = options;
    this.state = this.createInitialState(options.difficulty);

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none'; // Prevent scroll on mobile
    container.appendChild(canvas);
    this.canvas = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      options.onError(new Error('Failed to get 2D rendering context'));
      return;
    }
    this.ctx = ctx;

    // Handle click/tap input
    this.boundHandleClick = this.handleClick.bind(this);
    canvas.addEventListener('click', this.boundHandleClick);
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener);

    // Handle responsive resizing
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.resizeCanvas(width, height);
      }
    });
    this.resizeObserver.observe(container);

    // Initial sizing
    this.resizeCanvas(container.clientWidth, container.clientHeight);

    // Start render loop
    this.startRenderLoop();
  }

  // ─── Unmount ────────────────────────────────────────────
  unmount(): void {
    // 1. Cancel the animation frame
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }

    // 2. Disconnect resize observer
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    // 3. Remove event listeners
    if (this.canvas && this.boundHandleClick) {
      this.canvas.removeEventListener('click', this.boundHandleClick);
      this.boundHandleClick = null;
    }

    // 4. Remove canvas from container and clear
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }

    // 5. Null out references for GC
    this.canvas = null;
    this.ctx = null;
    this.options = null;
  }

  // ─── Pause / Resume ────────────────────────────────────
  pause(): void {
    this.paused = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  resume(): void {
    this.paused = false;
    this.startRenderLoop();
  }

  // ─── Canvas Sizing ─────────────────────────────────────
  private resizeCanvas(cssWidth: number, cssHeight: number): void {
    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    this.canvasWidth = cssWidth;
    this.canvasHeight = cssHeight;

    // Set buffer size for crisp rendering
    this.canvas.width = Math.floor(cssWidth * dpr);
    this.canvas.height = Math.floor(cssHeight * dpr);

    // Scale the context so drawing commands use CSS pixels
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Calculate grid layout (3×3 centered)
    const available = Math.min(cssWidth, cssHeight) - this.padding * 2;
    this.cellSize = Math.floor(available / 3);
    const gridSize = this.cellSize * 3;
    this.offsetX = Math.floor((cssWidth - gridSize) / 2);
    this.offsetY = Math.floor((cssHeight - gridSize) / 2);
  }

  // ─── Render Loop ───────────────────────────────────────
  private startRenderLoop(): void {
    if (this.paused) return;

    const loop = () => {
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private render(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    // Clear entire canvas
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw grid lines
    this.drawGrid(ctx);

    // Draw marks (X and O)
    this.drawMarks(ctx);

    // Draw hover highlight
    this.drawHover(ctx);

    // Draw win line animation
    this.drawWinLine(ctx);

    // Draw status text
    this.drawStatus(ctx);
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 2;

    for (let i = 1; i <= 2; i++) {
      // Vertical lines
      const x = this.offsetX + i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, this.offsetY);
      ctx.lineTo(x, this.offsetY + this.cellSize * 3);
      ctx.stroke();

      // Horizontal lines
      const y = this.offsetY + i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(this.offsetX, y);
      ctx.lineTo(this.offsetX + this.cellSize * 3, y);
      ctx.stroke();
    }
  }

  private drawMarks(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < 9; i++) {
      const mark = this.state.board[i];
      if (!mark) continue;

      const row = Math.floor(i / 3);
      const col = i % 3;
      const cx = this.offsetX + col * this.cellSize + this.cellSize / 2;
      const cy = this.offsetY + row * this.cellSize + this.cellSize / 2;
      const radius = this.cellSize * 0.35;

      if (mark === 'X') {
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - radius, cy - radius);
        ctx.lineTo(cx + radius, cy + radius);
        ctx.moveTo(cx + radius, cy - radius);
        ctx.lineTo(cx - radius, cy + radius);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#0f3460';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  private drawHover(ctx: CanvasRenderingContext2D): void {
    if (this.hoverCell < 0 || this.state.board[this.hoverCell] || this.state.winner) return;

    const row = Math.floor(this.hoverCell / 3);
    const col = this.hoverCell % 3;
    const x = this.offsetX + col * this.cellSize;
    const y = this.offsetY + row * this.cellSize;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x, y, this.cellSize, this.cellSize);
  }

  private drawWinLine(ctx: CanvasRenderingContext2D): void {
    if (!this.winLine) return;
    // Animate the win line drawing across the winning combination
    this.winLineProgress = Math.min(1, this.winLineProgress + 0.03);
    // ... (draw line from start cell center to end cell center with progress)
  }

  private drawStatus(ctx: CanvasRenderingContext2D): void {
    const text = this.state.winner
      ? this.state.winner === 'draw' ? "It's a Draw!" : `${this.state.winner} Wins!`
      : `${this.state.currentPlayer}'s Turn`;

    ctx.fillStyle = '#eee';
    ctx.font = '18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, this.canvasWidth / 2, this.offsetY - 10);
  }

  // ─── Input Handling ────────────────────────────────────
  private getCellFromEvent(e: MouseEvent): number {
    if (!this.canvas) return -1;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor((x - this.offsetX) / this.cellSize);
    const row = Math.floor((y - this.offsetY) / this.cellSize);

    if (col < 0 || col > 2 || row < 0 || row > 2) return -1;
    return row * 3 + col;
  }

  private handleClick(e: MouseEvent): void {
    if (this.state.winner || this.state.aiThinking) return;

    const cell = this.getCellFromEvent(e);
    if (cell < 0 || this.state.board[cell]) return;

    this.makeMove(cell);

    // If playing against AI and game isn't over
    if (!this.state.winner && this.state.currentPlayer === 'O') {
      this.state.aiThinking = true;
      setTimeout(() => {
        const aiMove = this.getAIMove();
        if (aiMove >= 0) this.makeMove(aiMove);
        this.state.aiThinking = false;
      }, 300 + Math.random() * 400);
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    this.hoverCell = this.getCellFromEvent(e);
  }

  private makeMove(cell: number): void {
    this.state.board[cell] = this.state.currentPlayer;
    this.state.winner = this.checkWinner();

    if (this.state.winner) {
      this.options?.onScoreUpdate(this.state.winner === 'X' ? 100 : this.state.winner === 'draw' ? 50 : 0);
      this.options?.onGameEnd(this.state.winner === 'X' ? 100 : this.state.winner === 'draw' ? 50 : 0);
    }

    this.state.currentPlayer = this.state.currentPlayer === 'X' ? 'O' : 'X';
  }

  // ─── Game Logic ────────────────────────────────────────
  private checkWinner(): Cell | 'draw' | null {
    const b = this.state.board;
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6],             // diags
    ];

    for (const [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        this.winLine = { start: a, end: c };
        return b[a];
      }
    }

    return b.every((cell) => cell !== null) ? 'draw' : null;
  }

  private getAIMove(): number {
    const empty = this.state.board.reduce<number[]>((acc, cell, i) => {
      if (!cell) acc.push(i);
      return acc;
    }, []);

    if (empty.length === 0) return -1;

    // Easy: random move
    if (this.state.difficulty === 'easy') {
      return empty[Math.floor(Math.random() * empty.length)];
    }

    // Medium: block winning moves, take winning moves
    // Hard: minimax (omitted for brevity)
    // ... AI logic here

    return empty[Math.floor(Math.random() * empty.length)];
  }
}

// ─── Export factory function ────────────────────────────────
export function createTicTacToe(): PlayBoxGame {
  return new TicTacToeGame();
}

export { metadata as ticTacToeMetadata };
```

### Key Integration Points for Canvas Games

| Concern | Pattern |
|---------|---------|
| **Canvas creation** | Game creates its own `<canvas>` inside the container in `mount()` |
| **Responsive resize** | Use `ResizeObserver` on the container; set `canvas.width/height` to `cssSize * devicePixelRatio` |
| **HiDPI support** | Scale the context with `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` after each resize |
| **Render loop** | Use `requestAnimationFrame` in a loop; store the frame ID for cancellation |
| **Click handling** | Convert `MouseEvent` coordinates to canvas-relative using `getBoundingClientRect()` |
| **Cleanup** | `cancelAnimationFrame`, disconnect `ResizeObserver`, remove event listeners, set `container.innerHTML = ''` |
| **Touch support** | Listen for both `click` and `touchstart`; use `touchAction: 'none'` to prevent scroll |

---

## 3. Kaboom.js Game Integration

Kaboom.js is a lightweight game development library designed for simplicity. It provides a declarative API for sprites, collision detection, and game loops — perfect for simple arcade games like Snake, Flappy Bird, and Pong. However, integrating Kaboom into a React-managed container requires careful handling because Kaboom is designed to "own" its canvas and game loop.

### The Core Challenge

Kaboom's `kaboom()` function initializes the engine and creates (or takes over) a canvas element. It sets up its own game loop, input handlers, and rendering pipeline. This creates several integration challenges:

1. **Canvas ownership:** By default, Kaboom appends a canvas to `<body>`. We must pass `{ canvas }` to redirect it.
2. **Global scope:** Kaboom v3000+ exports functions to a module scope. Multiple Kaboom instances can conflict if not properly isolated.
3. **Cleanup:** Kaboom doesn't expose a clean `destroy()` method in older versions. In v3000+, `kaboom()` returns a context object with an `onCleanup` hook, but we need to be thorough.
4. **Re-initialization:** If a user navigates away and back, Kaboom must be fully cleaned up before a new instance can safely initialize.

### Integration Strategy

We use Kaboom's `canvas` option to inject our own canvas element, and we carefully manage the Kaboom context reference for cleanup. The key insight is that `kaboom()` returns a `KaboomCtx` object, and all game objects, scenes, and behaviors are scoped to that context. When we unmount, we must destroy all references to that context.

### Complete Example: Snake

```typescript
// src/games/snake/index.ts

import type { PlayBoxGame, GameMetadata, MountOptions, Difficulty } from '../../types/game';
import { kaboom } from 'kaboom';

// ─── Metadata ───────────────────────────────────────────────
const metadata: GameMetadata = {
  id: 'snake',
  name: 'Snake',
  description: 'Guide the snake to eat food and grow longer. Don\'t hit the walls or yourself!',
  category: 'arcade',
  engine: 'kaboom',
  thumbnail: '/assets/thumbnails/snake.webp',
  difficulties: ['easy', 'medium', 'hard'],
  defaultDifficulty: 'medium',
  hasSound: true,
  minWidth: 400,
  minHeight: 400,
  aspectRatio: 1,
  version: '1.0.0',
};

// ─── Speed by difficulty ────────────────────────────────────
const SPEED_MAP: Record<Difficulty, number> = {
  easy: 6,    // 6 moves per second
  medium: 10,
  hard: 15,
};

// ─── Game Implementation ────────────────────────────────────
class SnakeGame implements PlayBoxGame {
  readonly metadata = metadata;

  private canvas: HTMLCanvasElement | null = null;
  private container: HTMLElement | null = null;
  private options: MountOptions | null = null;
  private kCtx: any = null; // KaboomCtx — typed as 'any' because Kaboom types vary
  private paused = false;
  private resizeObserver: ResizeObserver | null = null;
  private score = 0;
  private moveInterval: ReturnType<typeof setInterval> | null = null;

  // ─── Mount ──────────────────────────────────────────────
  mount(container: HTMLElement, options: MountOptions): void {
    this.container = container;
    this.options = options;
    this.score = 0;

    // 1. Create our own canvas that Kaboom will render into
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    this.canvas = canvas;

    // 2. Calculate grid dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    const gridSize = 20; // pixels per grid cell
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    // 3. Initialize Kaboom with our canvas
    try {
      this.kCtx = kaboom({
        canvas,
        width: cols * gridSize,
        height: rows * gridSize,
        background: [26, 26, 46], // #1a1a2e
        crisp: true,               // Pixel-art style
        global: false,             // Don't pollute global scope
        debug: false,
        // Prevent Kaboom from adding its own canvas to the DOM
        root: container,
      });
    } catch (err) {
      options.onError(new Error(`Kaboom init failed: ${(err as Error).message}`));
      return;
    }

    const k = this.kCtx;
    const speed = SPEED_MAP[options.difficulty];

    // 4. Define game scene
    k.scene('game', () => {
      // ─── Game Constants ──────────────────────────────────
      const GRID = gridSize;

      // ─── Snake State ─────────────────────────────────────
      const snake: any[] = [];
      const startPos = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
      let dir = k.vec2(1, 0);    // Moving right initially
      let nextDir = k.vec2(1, 0); // Buffered direction change
      let foodPos = { x: 0, y: 0 };
      let alive = true;

      // ─── Create Snake Segments ───────────────────────────
      for (let i = 0; i < 3; i++) {
        snake.push(
          k.add([
            k.rect(GRID - 2, GRID - 2),
            k.pos((startPos.x - i) * GRID, startPos.y * GRID),
            k.color(46, 204, 113),
            k.area(),
            'snake',
          ])
        );
      }

      // ─── Create Food ─────────────────────────────────────
      const food = k.add([
        k.rect(GRID - 2, GRID - 2),
        k.pos(0, 0),
        k.color(233, 69, 96),
        k.area(),
        'food',
      ]);

      function spawnFood(): void {
        const validPositions: { x: number; y: number }[] = [];
        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            // Check no snake segment occupies this cell
            if (!snake.some((s: any) =>
              Math.floor(s.pos.x / GRID) === x && Math.floor(s.pos.y / GRID) === y
            )) {
              validPositions.push({ x, y });
            }
          }
        }
        if (validPositions.length > 0) {
          const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
          foodPos = pos;
          food.pos = k.vec2(pos.x * GRID, pos.y * GRID);
        }
      }
      spawnFood();

      // ─── Input Handling ──────────────────────────────────
      k.onKeyPress('left', () => { if (dir.x === 0) nextDir = k.vec2(-1, 0); });
      k.onKeyPress('right', () => { if (dir.x === 0) nextDir = k.vec2(1, 0); });
      k.onKeyPress('up', () => { if (dir.y === 0) nextDir = k.vec2(0, -1); });
      k.onKeyPress('down', () => { if (dir.y === 0) nextDir = k.vec2(0, 1); });

      // ─── Game Loop ───────────────────────────────────────
      k.onUpdate(speed, () => {
        if (!alive) return;

        dir = nextDir;
        const head = snake[0];
        const newPos = k.vec2(
          head.pos.x + dir.x * GRID,
          head.pos.y + dir.y * GRID
        );

        // Wall collision
        if (
          newPos.x < 0 || newPos.x >= cols * GRID ||
          newPos.y < 0 || newPos.y >= rows * GRID
        ) {
          die();
          return;
        }

        // Self collision
        for (const seg of snake) {
          if (seg.pos.x === newPos.x && seg.pos.y === newPos.y) {
            die();
            return;
          }
        }

        // Move snake: add new head
        const newHead = k.add([
          k.rect(GRID - 2, GRID - 2),
          k.pos(newPos.x, newPos.y),
          k.color(46, 204, 113),
          k.area(),
          'snake',
        ]);
        snake.unshift(newHead);

        // Food collision
        if (newPos.x / GRID === foodPos.x && newPos.y / GRID === foodPos.y) {
          this.score += 10;
          this.options?.onScoreUpdate(this.score);
          spawnFood();
        } else {
          // Remove tail (no growth)
          const tail = snake.pop();
          if (tail) k.destroy(tail);
        }
      });

      function die(): void {
        alive = false;
        // Flash screen red
        k.add([
          k.rect(k.width(), k.height()),
          k.pos(0, 0),
          k.color(233, 69, 96),
          k.opacity(0.3),
          k.fixed(),
          k.z(100),
        ]);
        k.wait(1, () => {
          this.options?.onGameEnd(this.score);
        });
      }
    });

    // 5. Start the game scene
    k.go('game');

    // 6. Handle resize
    this.resizeObserver = new ResizeObserver((entries) => {
      // Kaboom doesn't support dynamic resize well.
      // Best approach: record new size and reinitialize on next mount.
      // For now, we just log — Kaboom renders at its init size.
      for (const entry of entries) {
        console.log('[Snake] Container resized:', entry.contentRect);
      }
    });
    this.resizeObserver.observe(container);
  }

  // ─── Unmount ────────────────────────────────────────────
  unmount(): void {
    // 1. Disconnect resize observer
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    // 2. Destroy the Kaboom context
    // Kaboom v3000+ provides a cleanup mechanism through the context.
    // We must null out all references so GC can collect the Kaboom state.
    if (this.kCtx) {
      // Kaboom doesn't have a built-in destroy() in all versions.
      // The safest approach is to:
      //   a) Remove all scenes
      //   b) Clear all event handlers
      //   c) Stop the game loop by going to an empty scene
      try {
        this.kCtx.scene('___cleanup___', () => {});
        this.kCtx.go('___cleanup___');
      } catch {
        // Scene may not exist, that's OK
      }
      this.kCtx = null;
    }

    // 3. Remove canvas from container
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }

    // 4. Null references
    this.canvas = null;
    this.options = null;
  }

  // ─── Pause / Resume ────────────────────────────────────
  pause(): void {
    this.paused = true;
    // Kaboom doesn't have a built-in pause. We can use debug.pause()
    // or set a flag that our onUpdate callback checks.
    if (this.kCtx) {
      try {
        this.kCtx.debug.pause();
      } catch {
        // Fallback: the game loop continues but our handler checks paused flag
      }
    }
  }

  resume(): void {
    this.paused = false;
    if (this.kCtx) {
      try {
        this.kCtx.debug.resume();
      } catch {
        // No-op
      }
    }
  }
}

// ─── Export ─────────────────────────────────────────────────
export function createSnake(): PlayBoxGame {
  return new SnakeGame();
}

export { metadata as snakeMetadata };
```

### Known Kaboom Integration Issues and Mitigations

| Issue | Mitigation |
|-------|-----------|
| **No `destroy()` method** | Navigate to an empty cleanup scene, then null the context. Remove the canvas from DOM manually. |
| **Global scope pollution** | Always pass `global: false` to `kaboom()`. Use the returned context object for all API calls instead of global functions. |
| **Cannot resize after init** | Kaboom's width/height are set at init time and cannot be changed. If the container resizes significantly, the game must be unmounted and remounted. Document this limitation. |
| **Multiple Kaboom instances** | Kaboom v3000+ supports multiple instances when `global: false`, but they share some internal state (WebAudio context). Test thoroughly if two Kaboom games are ever mounted simultaneously (they shouldn't be in PlayBox). |
| **Audio context** | Kaboom creates a WebAudio context on init. Browsers require user gesture to start audio. The shell should handle the "click to enable sound" UX before mounting. |
| **Event listeners leak** | Kaboom registers `keydown`/`keyup` listeners on `window`. With `global: false`, these are scoped to the context, but verify they're removed on unmount by checking `window` event listeners in DevTools. |

---

## 4. Phaser 3 Game Integration

Phaser 3 is the most full-featured engine in PlayBox's tier system. It provides sprite management, physics, tilemaps, particle systems, and a scene manager — essential for sprite-heavy games like Platformer, Space Invaders, and Flappy Bird. However, its size (~1MB minified) and complex lifecycle make it the most challenging engine to integrate cleanly.

### The Core Challenge

Phaser creates its own canvas via `new Phaser.Game(config)` and manages its own game loop, input, and rendering pipeline. The `parent` config option tells Phaser where to append its canvas, but Phaser still "owns" the DOM element it creates. The primary challenges are:

1. **Phaser creates its canvas:** Unlike plain Canvas or Kaboom (where we can pass our own canvas), Phaser creates its own `<canvas>` inside the parent element. We must work with this, not fight it.
2. **Destroy is critical:** `Phaser.Game.destroy()` must be called explicitly. If we just remove the container from the DOM, Phaser's game loop, RAF callbacks, and event listeners continue running, causing massive memory leaks.
3. **Async initialization:** Phaser's boot process is asynchronous. Scenes don't start until the game has fully booted. We must wait for the `READY` event before interacting with the game.
4. **Scale manager:** Phaser has its own scale management system. We need to configure it to respect our container's dimensions rather than the window size.

### Integration Strategy

We use Phaser's `parent` config option to inject our container, configure the Scale Manager to `RESIZE` mode, and carefully call `game.destroy(true)` in `unmount()`. The `true` argument tells Phaser to remove its canvas from the DOM.

### Complete Example: Flappy Bird

```typescript
// src/games/flappy-bird/index.ts

import Phaser from 'phaser';
import type { PlayBoxGame, GameMetadata, MountOptions, Difficulty } from '../../types/game';

// ─── Metadata ───────────────────────────────────────────────
const metadata: GameMetadata = {
  id: 'flappy-bird',
  name: 'Flappy Bird',
  description: 'Tap to flap! Navigate through pipes without crashing.',
  category: 'arcade',
  engine: 'phaser',
  thumbnail: '/assets/thumbnails/flappy-bird.webp',
  difficulties: ['easy', 'medium', 'hard'],
  defaultDifficulty: 'medium',
  hasSound: true,
  minWidth: 320,
  minHeight: 480,
  aspectRatio: 9 / 16,
  version: '1.0.0',
};

// ─── Difficulty Settings ────────────────────────────────────
interface DifficultyConfig {
  gravity: number;
  flapForce: number;
  pipeSpeed: number;
  pipeGap: number;
  pipeFrequency: number;
}

const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
  easy:   { gravity: 800,  flapForce: -300, pipeSpeed: 150, pipeGap: 180, pipeFrequency: 2200 },
  medium: { gravity: 1000, flapForce: -350, pipeSpeed: 200, pipeGap: 150, pipeFrequency: 1800 },
  hard:   { gravity: 1200, flapForce: -400, pipeSpeed: 280, pipeGap: 120, pipeFrequency: 1400 },
};

// ─── Constants ──────────────────────────────────────────────
const BIRD_SIZE = 34;
const PIPE_WIDTH = 52;
const GROUND_HEIGHT = 100;

// ─── Game Scene ─────────────────────────────────────────────
class FlappyScene extends Phaser.Scene {
  private gameOptions: MountOptions | null = null;
  private config: DifficultyConfig | null = null;
  private bird!: Phaser.Physics.Arcade.Sprite;
  private pipes!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private isGameRunning = false;
  private ground!: Phaser.GameObjects.TileSprite;
  private pipeTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'FlappyScene' });
  }

  init(data: { options: MountOptions; config: DifficultyConfig }): void {
    this.gameOptions = data.options;
    this.config = data.config;
    this.score = 0;
    this.isGameRunning = false;
  }

  create(): void {
    const { width, height } = this.scale;
    const cfg = this.config!;

    // ─── Background ─────────────────────────────────────────
    // Sky gradient (using a simple colored rectangle since we don't have assets)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x70c5ce, 0x70c5ce, 0x4a90d9, 0x4a90d9);
    bg.fillRect(0, 0, width, height);

    // ─── Pipe Group ─────────────────────────────────────────
    this.pipes = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // ─── Bird ───────────────────────────────────────────────
    this.bird = this.physics.add.sprite(width * 0.25, height * 0.4, '');
    if (this.bird.body) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setCircle(BIRD_SIZE / 2);
    }
    // Draw bird as a simple circle (in production, use a sprite sheet)
    const birdGfx = this.add.graphics();
    birdGfx.fillStyle(0xf7dc6f, 1);
    birdGfx.fillCircle(BIRD_SIZE / 2, BIRD_SIZE / 2, BIRD_SIZE / 2);
    birdGfx.generateTexture('bird', BIRD_SIZE, BIRD_SIZE);
    birdGfx.destroy();
    this.bird.setTexture('bird');
    this.bird.setOrigin(0.5);

    // ─── Ground ─────────────────────────────────────────────
    const groundGfx = this.add.graphics();
    groundGfx.fillStyle(0x8b4513);
    groundGfx.fillRect(0, 0, width, GROUND_HEIGHT);
    groundGfx.generateTexture('ground', width, GROUND_HEIGHT);
    groundGfx.destroy();

    this.ground = this.add.tileSprite(0, height - GROUND_HEIGHT, width, GROUND_HEIGHT, 'ground');
    this.ground.setOrigin(0, 0);

    // Ground physics body
    const groundCollider = this.physics.add.staticImage(width / 2, height - GROUND_HEIGHT / 2, 'ground');

    // ─── Score Text ─────────────────────────────────────────
    this.scoreText = this.add.text(width / 2, 50, '0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10);

    // ─── Collisions ────────────────────────────────────────
    this.physics.add.collider(this.bird, groundCollider, this.hitObstacle, undefined, this);
    this.physics.add.overlap(this.bird, this.pipes, this.hitObstacle, undefined, this);

    // ─── Input ─────────────────────────────────────────────
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard?.on('keydown-SPACE', this.flap, this);

    // ─── Instruction text ──────────────────────────────────
    const instruction = this.add.text(width / 2, height * 0.6, 'Tap or Press Space to Start', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Start game on first tap
    this.input.once('pointerdown', () => {
      instruction.destroy();
      this.startGame();
    });
  }

  private startGame(): void {
    this.isGameRunning = true;
    this.physics.resume();

    // Schedule pipe spawning
    this.pipeTimer = this.time.addEvent({
      delay: this.config!.pipeFrequency,
      callback: this.spawnPipe,
      callbackScope: this,
      loop: true,
    });

    // Immediate first pipe
    this.spawnPipe();
  }

  private flap(): void {
    if (!this.isGameRunning && this.bird.body) {
      this.startGame();
    }
    if (this.bird.body) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(this.config!.flapForce);
    }
    // Play flap sound
    this.gameOptions?.utilities.sound.playSfx('flap');
  }

  private spawnPipe(): void {
    if (!this.isGameRunning) return;

    const { width, height } = this.scale;
    const cfg = this.config!;
    const playHeight = height - GROUND_HEIGHT;

    // Random gap position
    const minY = cfg.pipeGap / 2 + 50;
    const maxY = playHeight - cfg.pipeGap / 2 - 50;
    const gapCenterY = Phaser.Math.Between(minY, maxY);

    // Create pipe texture if not exists
    if (!this.textures.exists('pipe')) {
      const pipeGfx = this.add.graphics();
      pipeGfx.fillStyle(0x2ecc71);
      pipeGfx.fillRect(0, 0, PIPE_WIDTH, playHeight);
      pipeGfx.generateTexture('pipe', PIPE_WIDTH, playHeight);
      pipeGfx.destroy();
    }

    // Top pipe
    const topPipe = this.pipes.create(width + PIPE_WIDTH, gapCenterY - cfg.pipeGap / 2, 'pipe');
    topPipe.setOrigin(0.5, 1);
    topPipe.setImmovable(true);
    (topPipe.body as Phaser.Physics.Arcade.Body).setVelocityX(-cfg.pipeSpeed);
    (topPipe.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Bottom pipe
    const bottomPipe = this.pipes.create(width + PIPE_WIDTH, gapCenterY + cfg.pipeGap / 2, 'pipe');
    bottomPipe.setOrigin(0.5, 0);
    bottomPipe.setImmovable(true);
    (bottomPipe.body as Phaser.Physics.Arcade.Body).setVelocityX(-cfg.pipeSpeed);
    (bottomPipe.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Score trigger: invisible sensor between pipes
    const scoreZone = this.physics.add.staticSprite(
      width + PIPE_WIDTH + PIPE_WIDTH / 2,
      gapCenterY,
      ''
    );
    // Set an invisible body for scoring
    scoreZone.setVisible(false);
    this.physics.add.overlap(this.bird, scoreZone, () => {
      this.score++;
      this.scoreText.setText(String(this.score));
      this.gameOptions?.onScoreUpdate(this.score);
      scoreZone.destroy();
    });

    // Clean up pipes that have moved off screen
    this.time.delayedCall(8000, () => {
      topPipe.destroy();
      bottomPipe.destroy();
    });
  }

  private hitObstacle(): void {
    if (!this.isGameRunning) return;
    this.isGameRunning = false;

    // Stop pipe spawning
    if (this.pipeTimer) {
      this.pipeTimer.remove();
      this.pipeTimer = null;
    }

    // Stop all pipe movement
    this.pipes.children.iterate((pipe) => {
      if (pipe && pipe.body) {
        (pipe.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
      }
      return true;
    });

    // Flash effect
    this.cameras.main.flash(500, 255, 0, 0);

    // Game over after delay
    this.time.delayedCall(1000, () => {
      this.gameOptions?.onGameEnd(this.score);
    });
  }

  update(): void {
    if (this.isGameRunning) {
      // Scroll ground
      this.ground.tilePositionX += this.config!.pipeSpeed * this.game.loop.delta / 1000;
    }

    // Rotate bird based on velocity
    if (this.bird && this.bird.body) {
      const velocity = (this.bird.body as Phaser.Physics.Arcade.Body).velocity.y;
      const angle = Phaser.Math.Clamp(velocity * 0.05, -30, 90);
      this.bird.setAngle(angle);
    }
  }
}

// ─── Game Class ─────────────────────────────────────────────
class FlappyBirdGame implements PlayBoxGame {
  readonly metadata = metadata;

  private phaserGame: Phaser.Game | null = null;
  private container: HTMLElement | null = null;
  private options: MountOptions | null = null;
  private paused = false;

  // ─── Mount ──────────────────────────────────────────────
  mount(container: HTMLElement, options: MountOptions): void {
    this.container = container;
    this.options = options;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const config = DIFFICULTY_CONFIG[options.difficulty];

    // Create Phaser game instance
    this.phaserGame = new Phaser.Game({
      type: Phaser.AUTO, // Use WebGL if available, fallback to Canvas
      parent: container, // Phaser will create its canvas inside this element
      width,
      height,
      backgroundColor: '#70c5ce',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: config.gravity },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,  // Automatically resize when container changes
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width,
        height,
      },
      scene: [FlappyScene],
      // Disable right-click context menu on canvas
      disableContextMenu: true,
      // Audio settings
      audio: {
        disableWebAudio: false,
      },
      // Banner config (disable in production)
      banner: false,
      // FPS settings
      fps: {
        target: 60,
        forceSetTimeOut: false,
      },
      // Input settings — prevent Phaser from capturing all input
      input: {
        keyboard: {
          capture: [Phaser.Input.Keyboard.KeyCodes.SPACE],
        },
      },
    });

    // Wait for Phaser to be ready, then start the game scene
    this.phaserGame.events.once('ready', () => {
      this.phaserGame?.scene.start('FlappyScene', { options, config });
    });

    // Handle Phaser errors
    this.phaserGame.events.on('error', (err: Error) => {
      options.onError(err);
    });
  }

  // ─── Unmount ────────────────────────────────────────────
  unmount(): void {
    if (this.phaserGame) {
      // 1. Stop all scenes
      this.phaserGame.scene.getScenes(true).forEach((scene) => {
        scene.scene.stop();
      });

      // 2. Destroy the Phaser game instance
      //    The `true` argument removes the canvas from the DOM.
      //    The `false` second argument means don't remove the parent element.
      this.phaserGame.destroy(true, false);
      this.phaserGame = null;
    }

    // 3. Clean up the container (belt-and-suspenders)
    if (this.container) {
      // Phaser should have removed its canvas, but clear any remaining elements
      this.container.innerHTML = '';
      this.container = null;
    }

    this.options = null;
  }

  // ─── Pause / Resume ────────────────────────────────────
  pause(): void {
    this.paused = true;
    if (this.phaserGame) {
      // Pause the physics engine and scene logic
      const scene = this.phaserGame.scene.getScene('FlappyScene');
      if (scene) {
        scene.physics.world.pause();
        scene.scene.pause();
      }
    }
  }

  resume(): void {
    this.paused = false;
    if (this.phaserGame) {
      const scene = this.phaserGame.scene.getScene('FlappyScene');
      if (scene) {
        scene.scene.resume();
        scene.physics.world.resume();
      }
    }
  }
}

// ─── Export ─────────────────────────────────────────────────
export function createFlappyBird(): PlayBoxGame {
  return new FlappyBirdGame();
}

export { metadata as flappyBirdMetadata };
```

### Known Phaser Integration Issues and Mitigations

| Issue | Mitigation |
|-------|-----------|
| **`game.destroy(true)` is essential** | Always call with `true` to remove canvas. Without it, the canvas stays in DOM and the RAF loop continues. |
| **Phaser captures keyboard events globally** | Use `input.keyboard.capture` to limit which keys Phaser captures. Without this, Phaser's keyboard handler prevents default on all keys, breaking the shell's shortcuts. |
| **Scale manager fights CSS** | Use `Phaser.Scale.RESIZE` mode so Phaser adapts to our container. Never use `Phaser.Scale.FIT` or `Phaser.Scale.ENVELOP` as they create a wrapper div that fights with React. |
| **Audio context on boot** | Phaser creates a WebAudio context on boot. If no user gesture has occurred, audio will be suspended. The shell must handle the initial user interaction before mounting. |
| **Texture memory** | Phaser caches textures globally in the TextureManager. When unmounting, explicitly remove game-specific textures: `this.textures.remove('pipe')`, etc. |
| **Timer events** | Phaser's `time.addEvent` creates timer events that persist across scene restarts. Always remove them with `timerEvent.remove()` in the scene's `shutdown` method. |
| **Physics world bodies** | Bodies in the Arcade physics world must be explicitly destroyed. Set `this.physics.world.destroy()` in the scene shutdown. |

### Phaser Scene Lifecycle Best Practices

```typescript
// Always implement shutdown() to clean up scene-specific resources
class MyScene extends Phaser.Scene {
  private pipeTimer: Phaser.Time.TimerEvent | null = null;

  shutdown(): void {
    // Remove timer events
    if (this.pipeTimer) {
      this.pipeTimer.remove();
      this.pipeTimer = null;
    }

    // Destroy groups
    this.pipes?.clear(true, true);

    // Remove custom textures
    this.textures.remove('pipe');
    this.textures.remove('bird');

    // Remove input handlers
    this.input.off('pointerdown', this.flap, this);
    this.input.keyboard?.off('keydown-SPACE', this.flap, this);
  }
}
```

---

## 5. Lazy Loading Strategy

PlayBox targets 50+ games. Loading all game code upfront would mean downloading megabytes of JavaScript that the user may never need. Lazy loading is not optional — it is a hard requirement for performance. With Vite and React, we have excellent built-in tools for code splitting and dynamic imports.

### Architecture Overview

Each game is compiled into its own chunk by Vite. The React shell uses `React.lazy()` to load game wrapper components on demand. When a user clicks a game in the catalog, the shell dynamically imports that game's chunk, shows a loading spinner while the chunk downloads, then mounts the game.

### Directory Structure

```
src/
├── games/
│   ├── tic-tac-toe/
│   │   └── index.ts          ← implements PlayBoxGame
│   ├── snake/
│   │   └── index.ts
│   ├── flappy-bird/
│   │   └── index.ts
│   └── ... (50+ game folders)
├── components/
│   ├── GameWrapper.tsx        ← React component that mounts a PlayBoxGame
│   └── GameCatalog.tsx        ← Browses available games
├── hooks/
│   └── useGameLoader.ts      ← Custom hook for lazy loading
├── types/
│   └── game.ts               ← PlayBoxGame interface
└── registry/
    └── gameRegistry.ts       ← Maps game IDs to lazy import functions
```

### Game Registry with Vite Dynamic Imports

The registry maps each game ID to a dynamic `import()` call. Vite transforms each `import()` into a separate chunk at build time:

```typescript
// src/registry/gameRegistry.ts

import type { PlayBoxGame, GameMetadata } from '../types/game';

export interface GameRegistryEntry {
  id: string;
  metadata: GameMetadata;
  /** Dynamic import function — Vite creates a separate chunk for each */
  loader: () => Promise<{ createGame: () => PlayBoxGame }>;
  /** Chunk name for debugging and preload hints */
  chunkName: string;
  /** Estimated chunk size in KB (for preload priority) */
  estimatedSize: number;
}

/**
 * All registered games. Each entry has a lazy import that Vite
 * will code-split into a separate chunk.
 */
export const gameRegistry: GameRegistryEntry[] = [
  // ─── Canvas Games (tiny, ~5-15 KB each) ──────────────────
  {
    id: 'tic-tac-toe',
    metadata: (await import('../games/tic-tac-toe/index.ts')).ticTacToeMetadata,
    loader: () => import(/* webpackChunkName: "game-tic-tac-toe" */ '../games/tic-tac-toe/index.ts'),
    chunkName: 'game-tic-tac-toe',
    estimatedSize: 8,
  },
  {
    id: 'chess',
    metadata: (await import('../games/chess/index.ts')).chessMetadata,
    loader: () => import('../games/chess/index.ts'),
    chunkName: 'game-chess',
    estimatedSize: 25,
  },
  {
    id: '2048',
    metadata: (await import('../games/2048/index.ts')).metadata2048,
    loader: () => import('../games/2048/index.ts'),
    chunkName: 'game-2048',
    estimatedSize: 10,
  },

  // ─── Kaboom Games (medium, ~50-80 KB each — includes kaboom runtime) ──
  {
    id: 'snake',
    metadata: (await import('../games/snake/index.ts')).snakeMetadata,
    loader: () => import('../games/snake/index.ts'),
    chunkName: 'game-snake',
    estimatedSize: 65,
  },
  {
    id: 'pong',
    metadata: (await import('../games/pong/index.ts')).pongMetadata,
    loader: () => import('../games/pong/index.ts'),
    chunkName: 'game-pong',
    estimatedSize: 60,
  },

  // ─── Phaser Games (large, ~300-500 KB each — includes Phaser runtime) ──
  {
    id: 'flappy-bird',
    metadata: (await import('../games/flappy-bird/index.ts')).flappyBirdMetadata,
    loader: () => import('../games/flappy-bird/index.ts'),
    chunkName: 'game-flappy-bird',
    estimatedSize: 450,
  },
  {
    id: 'platformer',
    metadata: (await import('../games/platformer/index.ts')).platformerMetadata,
    loader: () => import('../games/platformer/index.ts'),
    chunkName: 'game-platformer',
    estimatedSize: 500,
  },
];
```

**Important:** The above pattern with top-level `await` for metadata is illustrative. In practice, we use a two-phase approach: metadata is loaded from a static JSON file for the catalog, and the game code is loaded lazily only when the user plays.

### Better Approach: Static Metadata, Lazy Game Code

```typescript
// src/registry/gameMetadata.ts
// This file is imported eagerly (tiny — just JSON-like objects)
import type { GameMetadata } from '../types/game';

export const gameMetadataMap: Record<string, GameMetadata> = {
  'tic-tac-toe': {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Classic 3×3 grid. Play against a friend or the computer.',
    category: 'logic',
    engine: 'canvas',
    thumbnail: '/assets/thumbnails/tic-tac-toe.webp',
    difficulties: ['easy', 'medium', 'hard'],
    defaultDifficulty: 'medium',
    hasSound: true,
    aspectRatio: 1,
    version: '1.0.0',
  },
  // ... (all 50+ entries — this file is ~30KB total)
};

// src/registry/gameLoaders.ts
// This file defines lazy loaders — imported eagerly but NOT executed
import type { PlayBoxGame } from '../types/game';

export type GameFactory = () => PlayBoxGame;

export const gameLoaders: Record<string, () => Promise<GameFactory>> = {
  'tic-tac-toe': () =>
    import('../games/tic-tac-toe/index.ts').then((m) => m.createTicTacToe),

  'snake': () =>
    import('../games/snake/index.ts').then((m) => m.createSnake),

  'flappy-bird': () =>
    import('../games/flappy-bird/index.ts').then((m) => m.createFlappyBird),

  // ... (all 50+ entries — this file is ~5KB, just function references)
};
```

### React.lazy() Integration

```typescript
// src/hooks/useGameLoader.ts

import { useState, useCallback } from 'react';
import type { PlayBoxGame } from '../types/game';
import { gameLoaders, type GameFactory } from '../registry/gameLoaders';

interface UseGameLoaderResult {
  game: PlayBoxGame | null;
  loading: boolean;
  error: Error | null;
  loadGame: (gameId: string) => void;
  clearGame: () => void;
}

export function useGameLoader(): UseGameLoaderResult {
  const [game, setGame] = useState<PlayBoxGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadGame = useCallback((gameId: string) => {
    const loader = gameLoaders[gameId];
    if (!loader) {
      setError(new Error(`Unknown game: ${gameId}`));
      return;
    }

    setLoading(true);
    setError(null);

    loader()
      .then((factory: GameFactory) => {
        setGame(factory());
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const clearGame = useCallback(() => {
    setGame(null);
    setError(null);
  }, []);

  return { game, loading, error, loadGame, clearGame };
}
```

### Vite Chunk Naming Configuration

Vite uses Rollup under the hood. We can configure chunk naming in `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Name game chunks clearly
        chunkFileNames: (chunkInfo) => {
          // Game chunks get a predictable name
          if (chunkInfo.name?.startsWith('game-')) {
            return 'games/[name]-[hash].js';
          }
          // Shared vendor chunks
          if (chunkInfo.name === 'phaser') {
            return 'vendor/phaser-[hash].js';
          }
          if (chunkInfo.name === 'kaboom') {
            return 'vendor/kaboom-[hash].js';
          }
          return 'chunks/[name]-[hash].js';
        },
        // Separate vendor chunks for game engines
        manualChunks: {
          phaser: ['phaser'],
          kaboom: ['kaboom'],
        },
      },
    },
    // Increase chunk size warning limit (Phaser is large)
    chunkSizeWarningLimit: 600,
  },
});
```

### Preloading Adjacent Games

When a user plays a game, we can preload games from the same category to make the next launch instant:

```typescript
// src/utils/preloader.ts

import { gameLoaders } from '../registry/gameLoaders';
import { gameMetadataMap } from '../registry/gameMetadata';

/**
 * Preload all games in the same category as the currently playing game.
 * This warms the browser cache so the next game loads instantly.
 */
export function preloadAdjacentGames(currentGameId: string): void {
  const currentMeta = gameMetadataMap[currentGameId];
  if (!currentMeta) return;

  // Find games in the same category
  const adjacentGameIds = Object.entries(gameMetadataMap)
    .filter(([id, meta]) => id !== currentGameId && meta.category === currentMeta.category)
    .map(([id]) => id);

  // Preload with a small delay to avoid competing with the current game's network
  adjacentGameIds.forEach((gameId, index) => {
    setTimeout(() => {
      const loader = gameLoaders[gameId];
      if (loader) {
        loader().catch(() => {
          // Silently ignore preload failures
        });
      }
    }, 2000 + index * 500); // Stagger by 500ms each
  });
}

/**
 * Preload a specific game's chunk. Call this on hover
 * over a game card in the catalog for instant launch.
 */
export function preloadGame(gameId: string): void {
  const loader = gameLoaders[gameId];
  if (loader) {
    loader().catch(() => {});
  }
}
```

### Bundle Size Expectations

| Tier | Engine | Per-Game Chunk Size | Notes |
|------|--------|--------------------|----|
| **Canvas** | None (raw Canvas 2D) | 5–20 KB | Just game logic. No engine overhead. |
| **Kaboom** | kaboom (~45 KB gzipped) | 50–100 KB | First Kaboom game loads the engine; subsequent Kaboom games share the vendor chunk (only 5–15 KB incremental). |
| **Phaser** | phaser (~350 KB gzipped) | 350–600 KB | First Phaser game loads the engine. Subsequent Phaser games share the vendor chunk (only 10–50 KB incremental for game code + assets). |

**Key optimization:** Vite's `manualChunks` separates the engine code into shared vendor chunks. The first game of each engine tier loads the engine chunk, but subsequent games from the same tier only download the game-specific code. This means the effective incremental cost per game is only 5–50 KB after the first game of each tier.

---

## 6. Memory Management

Memory leaks are the #1 production issue in game platforms. When a user plays 10 games in a row, each game must clean up *completely* or the browser tab will eventually crash. PlayBox enforces strict memory management through the `unmount()` contract and through careful patterns in each engine integration.

### The Memory Leak Taxonomy in PlayBox

| Leak Source | Symptom | Detection Method |
|-------------|---------|-----------------|
| **Uncancelled RAF** | CPU stays high after unmount; tab drains battery | Chrome DevTools → Performance → check for `requestAnimationFrame` calls after unmount |
| **Phaser game not destroyed** | Canvas still in DOM; game loop still running | Heap snapshot shows `Phaser.Game` instances |
| **Kaboom context lingering** | Keyboard events still firing; canvas in DOM | Type in another game and see Kaboom respond |
| **Event listeners on window/document** | Stale handlers fire for games no longer mounted | Chrome DevTools → Event Listeners tab |
| **Timer/setInterval** | Callbacks fire after unmount, accessing dead state | Console errors referencing null objects |
| **WebAudio nodes** | Audio continues playing after unmount; AudioContexts accumulate | Chrome DevTools → Memory → check AudioContext count |
| **Canvas backing stores** | Large pixel buffers remain in GPU memory | Chrome DevTools → Memory → check detached canvases |
| **Closure references** | Game objects kept alive by closures in callbacks | Heap snapshot → retained size analysis |

### The Unmount Checklist

Every game's `unmount()` method must follow this exact checklist. Think of it as a pre-flight checklist in reverse:

```typescript
// Unmount checklist — every game must do ALL of these:

unmount(): void {
  // ✅ 1. Cancel ALL requestAnimationFrame calls
  if (this.animFrameId) {
    cancelAnimationFrame(this.animFrameId);
    this.animFrameId = 0;
  }

  // ✅ 2. Clear ALL timers (setTimeout, setInterval)
  if (this.timerId) {
    clearInterval(this.timerId);  // or clearTimeout
    this.timerId = null;
  }

  // ✅ 3. Destroy engine instance (Phaser / Kaboom)
  if (this.phaserGame) {
    this.phaserGame.destroy(true, false);
    this.phaserGame = null;
  }

  // ✅ 4. Remove ALL event listeners (including on window/document)
  window.removeEventListener('keydown', this.boundKeyDown);
  document.removeEventListener('visibilitychange', this.boundVisibilityChange);
  this.canvas?.removeEventListener('click', this.boundClick);

  // ✅ 5. Disconnect observers (ResizeObserver, IntersectionObserver, MutationObserver)
  this.resizeObserver?.disconnect();
  this.resizeObserver = null;

  // ✅ 6. Stop and close WebAudio nodes
  this.audioContext?.close();
  this.audioContext = null;
  this.gainNode?.disconnect();
  this.gainNode = null;

  // ✅ 7. Clear the container DOM
  this.container.innerHTML = '';
  this.container = null;

  // ✅ 8. Null ALL references for GC
  this.canvas = null;
  this.ctx = null;
  this.options = null;
  // ... null out every property that holds game state
}
```

### Engine-Specific Cleanup Patterns

#### Plain Canvas Cleanup

```typescript
// Plain Canvas games are the simplest to clean up.
// The key risks are: RAF leaks and event listener leaks.

class CanvasGame implements PlayBoxGame {
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private container: HTMLElement | null = null;

  // Bound handler references — MUST store these for removal
  private boundClick: ((e: MouseEvent) => void) | null = null;
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;

  mount(container: HTMLElement, options: MountOptions): void {
    this.container = container;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    this.canvas = canvas;

    // ⚠️ CRITICAL: Store bound references so we can remove the EXACT same function
    this.boundClick = this.handleClick.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);

    canvas.addEventListener('click', this.boundClick);
    window.addEventListener('keydown', this.boundKeyDown);
  }

  unmount(): void {
    // Cancel RAF
    cancelAnimationFrame(this.animFrameId);
    this.animFrameId = 0;

    // Remove listeners using stored references
    if (this.boundClick) {
      this.canvas?.removeEventListener('click', this.boundClick);
    }
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
    }

    // Disconnect observer
    this.resizeObserver?.disconnect();

    // Clear DOM
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Null everything
    this.canvas = null;
    this.container = null;
    this.boundClick = null;
    this.boundKeyDown = null;
  }

  private handleClick(e: MouseEvent): void { /* ... */ }
  private handleKeyDown(e: KeyboardEvent): void { /* ... */ }
}
```

#### Phaser Cleanup

```typescript
// Phaser cleanup is the most complex. The game.destroy() call handles
// most internal cleanup, but we must ensure scene shutdown hooks run.

unmount(): void {
  if (this.phaserGame) {
    // Step 1: Stop all scenes (triggers their shutdown() methods)
    const scenes = this.phaserGame.scene.getScenes(true);
    scenes.forEach((scene) => {
      scene.scene.stop();
    });

    // Step 2: Destroy the game instance
    //   - First arg (true): remove the canvas from the DOM
    //   - Second arg (false): don't remove the parent element (React owns it)
    this.phaserGame.destroy(true, false);
    this.phaserGame = null;
  }

  // Belt-and-suspenders: clear container
  if (this.container) {
    this.container.innerHTML = '';
    this.container = null;
  }
}
```

#### Kaboom Cleanup

```typescript
// Kaboom doesn't have a clean destroy API. Our strategy:
// 1. Navigate to an empty scene to stop all game objects
// 2. Clear the canvas manually
// 3. Remove the canvas from DOM

unmount(): void {
  if (this.kCtx) {
    try {
      // Navigate to an empty scene to stop all game logic
      this.kCtx.scene('__cleanup__', () => {});
      this.kCtx.go('__cleanup__');
    } catch {
      // Ignore errors during cleanup
    }
    this.kCtx = null;
  }

  // Remove canvas from DOM
  if (this.container) {
    this.container.innerHTML = '';
    this.container = null;
  }

  // Null references
  this.canvas = null;
  this.options = null;
}
```

### Common Memory Leak Patterns and How to Avoid Them

**Pattern 1: Arrow function event listeners**
```typescript
// ❌ BAD: Can never remove this listener
window.addEventListener('keydown', (e) => this.handleKey(e));

// ✅ GOOD: Store the bound reference
this.boundKeyHandler = this.handleKey.bind(this);
window.addEventListener('keydown', this.boundKeyHandler);
// ... later in unmount:
window.removeEventListener('keydown', this.boundKeyHandler);
```

**Pattern 2: setTimeout/setInterval without cleanup**
```typescript
// ❌ BAD: Timer fires after unmount, accessing dead state
setInterval(() => this.update(), 1000);

// ✅ GOOD: Store the ID and clear in unmount
this.intervalId = setInterval(() => this.update(), 1000);
// ... in unmount:
clearInterval(this.intervalId);
```

**Pattern 3: Closures capturing `this`**
```typescript
// ❌ BAD: The closure keeps `this` alive forever
const callback = () => {
  this.state.score++; // `this` is captured, preventing GC
};

// ✅ GOOD: Use weak references or explicitly detach
// In unmount(), null out the state so closures can't hold onto large objects
this.state = null as any;
```

**Pattern 4: Detached canvas nodes**
```typescript
// ❌ BAD: Canvas removed from DOM but still has a rendering context
container.removeChild(canvas);
// The canvas's backing store (potentially large GPU texture) persists

// ✅ GOOD: Explicitly clear the canvas before removal
canvas.width = 0;  // Releases the GPU backing store
canvas.height = 0;
container.removeChild(canvas);
```

### Memory Leak Detection in Development

We add a development-only memory monitor that runs after each game unmount:

```typescript
// src/utils/memoryMonitor.ts (DEV ONLY)

export function checkMemoryAfterUnmount(gameId: string): void {
  if (import.meta.env.PROD) return;

  // Force GC if available (Chrome DevTools)
  if ((globalThis as any).gc) {
    (globalThis as any).gc();
  }

  const mem = (performance as any).memory;
  if (mem) {
    console.log(
      `[PlayBox Memory] After unmounting "${gameId}": ` +
      `Used JS heap: ${(mem.usedJSHeapSize / 1048576).toFixed(1)} MB / ` +
      `${(mem.totalJSHeapSize / 1048576).toFixed(1)} MB`
    );
  }

  // Check for detached canvases
  const detachedCanvases = document.querySelectorAll('canvas');
  if (detachedCanvases.length > 0) {
    console.warn(
      `[PlayBox Memory] Found ${detachedCanvases.length} canvas elements still in DOM ` +
      `after unmounting "${gameId}". Possible leak!`
    );
  }
}
```

---

## 7. Shared Game Utilities

Every game needs common functionality: sound playback, input handling, score tracking, timing, and difficulty scaling. Rather than each game reimplementing these features (inconsistently), PlayBox provides shared utility objects that are injected via `MountOptions.utilities`. These utilities live in a dedicated `src/shared/` directory in the flat repo.

### Directory Structure

```
src/
├── shared/
│   ├── sound/
│   │   ├── SoundManager.ts     ← Global sound controller
│   │   └── sounds.ts           ← Sound sprite definitions
│   ├── input/
│   │   └── InputHelper.ts      ← Keyboard, mouse, touch, gamepad
│   ├── score/
│   │   └── ScoreTracker.ts     ← Local storage persistence
│   ├── timer/
│   │   └── GameTimer.ts        ← Pause-aware timer
│   └── difficulty/
│       └── DifficultyHelper.ts  ← Difficulty scaling utilities
├── hooks/
│   └── useGameUtilities.ts     ← React hook that creates utility instances
└── types/
    └── game.ts                 ← GameUtilities interface
```

### Sound Manager

```typescript
// src/shared/sound/SoundManager.ts

export interface SoundManager {
  /** Play a one-shot sound effect */
  playSfx(name: string, volume?: number): void;

  /** Start a looping background music track */
  playMusic(name: string, volume?: number): void;

  /** Stop the current background music */
  stopMusic(): void;

  /** Set global mute state */
  setMuted(muted: boolean): void;

  /** Set global volume (0–1) */
  setVolume(volume: number): void;

  /** Get current mute state */
  isMuted(): boolean;

  /** Preload a sound so it plays instantly when requested */
  preload(name: string, url: string): Promise<void>;

  /** Release all loaded audio — call during game unmount */
  dispose(): void;
}

export class WebAudioSoundManager implements SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private currentMusic: AudioBufferSourceNode | null = null;
  private muted = false;
  private volume = 0.7;

  constructor() {
    // Don't create AudioContext here — wait for user gesture
  }

  private ensureContext(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this.masterGain.gain.value = this.volume;
  }

  async preload(name: string, url: string): Promise<void> {
    this.ensureContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
    this.buffers.set(name, audioBuffer);
  }

  playSfx(name: string, volume = 1): void {
    if (this.muted) return;
    this.ensureContext();
    const buffer = this.buffers.get(name);
    if (!buffer || !this.ctx || !this.sfxGain) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.sfxGain);
    source.start(0);
  }

  playMusic(name: string, volume = 0.5): void {
    if (this.muted) return;
    this.ensureContext();
    this.stopMusic();

    const buffer = this.buffers.get(name);
    if (!buffer || !this.ctx || !this.musicGain) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.musicGain);
    source.start(0);
    this.currentMusic = source;
  }

  stopMusic(): void {
    if (this.currentMusic) {
      try { this.currentMusic.stop(); } catch { /* already stopped */ }
      this.currentMusic.disconnect();
      this.currentMusic = null;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  dispose(): void {
    this.stopMusic();
    this.buffers.clear();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }
}
```

### Input Helper

```typescript
// src/shared/input/InputHelper.ts

export interface InputHelper {
  /** Check if a key is currently held down */
  isKeyDown(key: string): boolean;

  /** Register a callback for key press (fires once per press) */
  onPress(key: string, callback: () => void): () => void; // returns unsubscribe fn

  /** Register a callback for key release */
  onRelease(key: string, callback: () => void): () => void;

  /** Get mouse/touch position relative to a given element */
  getPointerPosition(element: HTMLElement): { x: number; y: number };

  /** Check if pointer is currently down */
  isPointerDown(): boolean;

  /** Register a callback for pointer down on an element */
  onPointerDown(element: HTMLElement, callback: (x: number, y: number) => void): () => void;

  /** Clean up all listeners */
  dispose(): void;
}

export class DomInputHelper implements InputHelper {
  private keysDown = new Set<string>();
  private pressCallbacks = new Map<string, Set<() => void>>();
  private releaseCallbacks = new Map<string, Set<() => void>>();
  private pointerIsDown = false;
  private pointerPos = { x: 0, y: 0 };

  // Stored bound handlers for cleanup
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerUp: () => void;

  constructor() {
    this.boundKeyDown = (e: KeyboardEvent) => {
      this.keysDown.add(e.key);
      const callbacks = this.pressCallbacks.get(e.key);
      if (callbacks) callbacks.forEach((cb) => cb());
    };

    this.boundKeyUp = (e: KeyboardEvent) => {
      this.keysDown.delete(e.key);
      const callbacks = this.releaseCallbacks.get(e.key);
      if (callbacks) callbacks.forEach((cb) => cb());
    };

    this.boundPointerMove = (e: PointerEvent) => {
      this.pointerPos = { x: e.clientX, y: e.clientY };
    };

    this.boundPointerDown = (e: PointerEvent) => {
      this.pointerIsDown = true;
      this.pointerPos = { x: e.clientX, y: e.clientY };
    };

    this.boundPointerUp = () => {
      this.pointerIsDown = false;
    };

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointerup', this.boundPointerUp);
  }

  isKeyDown(key: string): boolean {
    return this.keysDown.has(key);
  }

  onPress(key: string, callback: () => void): () => void {
    if (!this.pressCallbacks.has(key)) {
      this.pressCallbacks.set(key, new Set());
    }
    this.pressCallbacks.get(key)!.add(callback);
    return () => this.pressCallbacks.get(key)?.delete(callback);
  }

  onRelease(key: string, callback: () => void): () => void {
    if (!this.releaseCallbacks.has(key)) {
      this.releaseCallbacks.set(key, new Set());
    }
    this.releaseCallbacks.get(key)!.add(callback);
    return () => this.releaseCallbacks.get(key)?.delete(callback);
  }

  getPointerPosition(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: this.pointerPos.x - rect.left,
      y: this.pointerPos.y - rect.top,
    };
  }

  isPointerDown(): boolean {
    return this.pointerIsDown;
  }

  onPointerDown(element: HTMLElement, callback: (x: number, y: number) => void): () => void {
    const handler = (e: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      callback(e.clientX - rect.left, e.clientY - rect.top);
    };
    element.addEventListener('pointerdown', handler);
    return () => element.removeEventListener('pointerdown', handler);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerdown', this.boundPointerDown);
    window.removeEventListener('pointerup', this.boundPointerUp);
    this.pressCallbacks.clear();
    this.releaseCallbacks.clear();
  }
}
```

### Score Tracker

```typescript
// src/shared/score/ScoreTracker.ts

export interface ScoreTracker {
  /** Save a score for the current game + difficulty */
  saveScore(gameId: string, score: number, difficulty: string): void;

  /** Get the high score for a game + difficulty */
  getHighScore(gameId: string, difficulty: string): number;

  /** Get all scores for a game */
  getScores(gameId: string): Array<{ difficulty: string; score: number; date: string }>;

  /** Clear all scores for a game */
  clearScores(gameId: string): void;
}

const STORAGE_PREFIX = 'playbox:score:';

export class LocalScoreTracker implements ScoreTracker {
  saveScore(gameId: string, score: number, difficulty: string): void {
    const key = `${STORAGE_PREFIX}${gameId}:${difficulty}`;
    const existing = this.getHighScore(gameId, difficulty);
    if (score > existing) {
      localStorage.setItem(key, JSON.stringify({
        score,
        date: new Date().toISOString(),
      }));
    }
  }

  getHighScore(gameId: string, difficulty: string): number {
    const key = `${STORAGE_PREFIX}${gameId}:${difficulty}`;
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    try {
      return JSON.parse(raw).score ?? 0;
    } catch {
      return 0;
    }
  }

  getScores(gameId: string): Array<{ difficulty: string; score: number; date: string }> {
    const results: Array<{ difficulty: string; score: number; date: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_PREFIX}${gameId}:`)) {
        const difficulty = key.replace(`${STORAGE_PREFIX}${gameId}:`, '');
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            results.push({ difficulty, ...JSON.parse(raw) });
          } catch { /* skip corrupt entries */ }
        }
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }

  clearScores(gameId: string): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_PREFIX}${gameId}:`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}
```

### Game Timer

```typescript
// src/shared/timer/GameTimer.ts

export interface GameTimer {
  /** Start the timer */
  start(): void;

  /** Pause the timer (accumulated time is preserved) */
  pause(): void;

  /** Resume after pause */
  resume(): void;

  /** Get elapsed time in milliseconds (excluding paused time) */
  elapsed(): number;

  /** Reset the timer to zero */
  reset(): void;

  /** Check if the timer is currently running */
  isRunning(): boolean;
}

export class PauseAwareGameTimer implements GameTimer {
  private startTime = 0;
  private pausedAt = 0;
  private accumulated = 0;
  private running = false;

  start(): void {
    if (this.running) return;
    this.startTime = performance.now();
    this.running = true;
  }

  pause(): void {
    if (!this.running) return;
    this.accumulated += performance.now() - this.startTime;
    this.running = false;
  }

  resume(): void {
    if (this.running) return;
    this.startTime = performance.now();
    this.running = true;
  }

  elapsed(): number {
    if (this.running) {
      return this.accumulated + (performance.now() - this.startTime);
    }
    return this.accumulated;
  }

  reset(): void {
    this.startTime = 0;
    this.accumulated = 0;
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}
```

### Difficulty Helper

```typescript
// src/shared/difficulty/DifficultyHelper.ts

import type { Difficulty } from '../../types/game';

export interface DifficultyHelper {
  /** Get a numeric scale factor for the current difficulty (0.5=easy, 1.0=medium, 1.5=hard) */
  getScaleFactor(): number;

  /** Interpolate a value across difficulties */
  interpolate<T extends number>(easy: T, medium: T, hard: T): T;

  /** Get the current difficulty string */
  getDifficulty(): Difficulty;
}

export class DefaultDifficultyHelper implements DifficultyHelper {
  private difficulty: Difficulty;

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty;
  }

  getScaleFactor(): number {
    const map: Record<Difficulty, number> = { easy: 0.5, medium: 1.0, hard: 1.5 };
    return map[this.difficulty];
  }

  interpolate<T extends number>(easy: T, medium: T, hard: T): T {
    const map: Record<Difficulty, T> = { easy, medium, hard };
    return map[this.difficulty];
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }
}
```

### React Hook for Utility Injection

```typescript
// src/hooks/useGameUtilities.ts

import { useMemo } from 'react';
import type { GameUtilities } from '../types/game';
import { WebAudioSoundManager } from '../shared/sound/SoundManager';
import { DomInputHelper } from '../shared/input/InputHelper';
import { LocalScoreTracker } from '../shared/score/ScoreTracker';
import { PauseAwareGameTimer } from '../shared/timer/GameTimer';

export function useGameUtilities(): GameUtilities {
  return useMemo(() => ({
    sound: new WebAudioSoundManager(),
    input: new DomInputHelper(),
    score: new LocalScoreTracker(),
    timer: new PauseAwareGameTimer(),
    difficulty: new DefaultDifficultyHelper('medium'), // overridden per-game
  }), []);
}
```

---

## 8. Testing Game Integration

Testing game integration is fundamentally different from testing game *logic*. We don't test whether Tic-Tac-Toe correctly detects a win (that's a unit test for the game's internal logic). We test whether the game correctly implements the `PlayBoxGame` contract: does it mount cleanly, unmount without leaks, and respond to lifecycle calls?

### Testing Strategy Overview

| Test Type | Scope | Tool | Runs On |
|-----------|-------|------|---------|
| **Contract tests** | Does the game implement `PlayBoxGame` correctly? | Vitest | Every PR |
| **Lifecycle tests** | Does mount/unmount/pause/resume work? | Vitest + jsdom | Every PR |
| **Memory leak tests** | Does unmount free all resources? | Playwright + Chrome DevTools Protocol | Nightly |
| **Visual regression** | Does the game render correctly? | Playwright screenshot comparison | Nightly |
| **Integration smoke test** | Does the full shell + game work end-to-end? | Playwright | Every PR |

### Contract Test: Does the Game Implement the Interface?

```typescript
// src/games/__tests__/gameContract.test.ts

import { describe, it, expect } from 'vitest';
import type { PlayBoxGame, GameMetadata } from '../../types/game';

/**
 * Generic contract test that every game must pass.
 * Import this and call it with each game's factory function.
 */
export function testGameContract(
  gameId: string,
  createGame: () => PlayBoxGame
): void {
  describe(`Game Contract: ${gameId}`, () => {
    let game: PlayBoxGame;

    beforeEach(() => {
      game = createGame();
    });

    it('should have a metadata property', () => {
      expect(game.metadata).toBeDefined();
    });

    it('should have metadata.id matching the game ID', () => {
      expect(game.metadata.id).toBe(gameId);
    });

    it('should have all required metadata fields', () => {
      const meta = game.metadata;
      const requiredFields: (keyof GameMetadata)[] = [
        'id', 'name', 'description', 'category', 'engine',
        'thumbnail', 'difficulties', 'defaultDifficulty',
        'hasSound', 'version',
      ];
      for (const field of requiredFields) {
        expect(meta[field]).toBeDefined();
      }
    });

    it('should have metadata.difficulties as a non-empty array', () => {
      expect(Array.isArray(game.metadata.difficulties)).toBe(true);
      expect(game.metadata.difficulties.length).toBeGreaterThan(0);
    });

    it('should have metadata.defaultDifficulty that is in the difficulties array', () => {
      expect(game.metadata.difficulties).toContain(game.metadata.defaultDifficulty);
    });

    it('should have a mount method', () => {
      expect(typeof game.mount).toBe('function');
    });

    it('should have an unmount method', () => {
      expect(typeof game.unmount).toBe('function');
    });

    it('should optionally have pause and resume methods', () => {
      // These are optional, so we just check they're functions if they exist
      if (game.pause) expect(typeof game.pause).toBe('function');
      if (game.resume) expect(typeof game.resume).toBe('function');
    });
  });
}
```

### Lifecycle Test: Mount and Unmount

```typescript
// src/games/__tests__/gameLifecycle.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { PlayBoxGame, MountOptions } from '../../types/game';
import { JSDOM } from 'jsdom';

/**
 * Generic lifecycle test that every game must pass.
 */
export function testGameLifecycle(
  gameId: string,
  createGame: () => PlayBoxGame
): void {
  describe(`Game Lifecycle: ${gameId}`, () => {
    let game: PlayBoxGame;
    let container: HTMLElement;
    let mountOptions: MountOptions;

    beforeEach(() => {
      game = createGame();
      container = document.createElement('div');
      container.style.width = '800px';
      container.style.height = '600px';
      document.body.appendChild(container);

      mountOptions = {
        difficulty: game.metadata.defaultDifficulty,
        soundEnabled: false,
        onScoreUpdate: vi.fn(),
        onGameEnd: vi.fn(),
        onError: vi.fn(),
        onNotify: vi.fn(),
        utilities: {
          sound: { playSfx: vi.fn(), playMusic: vi.fn(), stopMusic: vi.fn(), setMuted: vi.fn(), setVolume: vi.fn(), isMuted: vi.fn(), preload: vi.fn(), dispose: vi.fn() } as any,
          input: { isKeyDown: vi.fn(), onPress: vi.fn(), onRelease: vi.fn(), getPointerPosition: vi.fn(), isPointerDown: vi.fn(), onPointerDown: vi.fn(), dispose: vi.fn() } as any,
          score: { saveScore: vi.fn(), getHighScore: vi.fn(), getScores: vi.fn(), clearScores: vi.fn() } as any,
          timer: { start: vi.fn(), pause: vi.fn(), resume: vi.fn(), elapsed: vi.fn(), reset: vi.fn(), isRunning: vi.fn() } as any,
          difficulty: { getScaleFactor: vi.fn(), interpolate: vi.fn(), getDifficulty: vi.fn() } as any,
        },
      };
    });

    afterEach(() => {
      // Ensure cleanup even if test fails
      try { game.unmount(); } catch { /* already unmounted */ }
      container.remove();
    });

    it('should mount without errors', () => {
      expect(() => game.mount(container, mountOptions)).not.toThrow();
    });

    it('should add content to the container when mounted', () => {
      game.mount(container, mountOptions);
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it('should create a canvas element in the container', () => {
      game.mount(container, mountOptions);
      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    it('should unmount without errors', () => {
      game.mount(container, mountOptions);
      expect(() => game.unmount()).not.toThrow();
    });

    it('should clear the container on unmount', () => {
      game.mount(container, mountOptions);
      game.unmount();
      expect(container.innerHTML).toBe('');
    });

    it('should not throw when unmount is called on an unmounted game', () => {
      // Double-unmount should be safe
      game.mount(container, mountOptions);
      game.unmount();
      expect(() => game.unmount()).not.toThrow();
    });

    it('should call onScoreUpdate callback', () => {
      game.mount(container, mountOptions);
      // Trigger a score event specific to the game
      // (Each game test should override this with game-specific triggers)
    });

    it('should call onGameEnd callback', () => {
      game.mount(container, mountOptions);
      // Trigger a game-over event specific to the game
    });

    describe('pause and resume', () => {
      it('should have pause() and resume() methods if metadata indicates it', () => {
        game.mount(container, mountOptions);
        // If the game implements pause/resume, test them
        if (game.pause && game.resume) {
          expect(() => game.pause!()).not.toThrow();
          expect(() => game.resume!()).not.toThrow();
        }
      });
    });
  });
}
```

### Per-Game Test Files

Each game has its own test file that imports and runs the generic tests, then adds game-specific tests:

```typescript
// src/games/tic-tac-toe/__tests__/index.test.ts

import { describe } from 'vitest';
import { createTicTacToe } from '../index';
import { testGameContract } from '../../__tests__/gameContract.test';
import { testGameLifecycle } from '../../__tests__/gameLifecycle.test';

// Run generic contract tests
testGameContract('tic-tac-toe', createTicTacToe);

// Run generic lifecycle tests
testGameLifecycle('tic-tac-toe', createTicTacToe);

// Game-specific tests
describe('Tic-Tac-Toe specific', () => {
  // Test that clicking a cell places a mark
  // Test that the AI makes a move after the player
  // Test win detection
  // Test draw detection
  // etc.
});
```

### Memory Leak Test with Playwright

```typescript
// e2e/memory-leak.test.ts

import { test, expect } from '@playwright/test';

const GAME_IDS = ['tic-tac-toe', 'snake', 'flappy-bird'];

for (const gameId of GAME_IDS) {
  test(`memory leak test: ${gameId}`, async ({ page }) => {
    // Navigate to PlayBox
    await page.goto('http://localhost:5173');

    // Get baseline memory
    const baseline = await page.evaluate(() =>
      (performance as any).memory?.usedJSHeapSize ?? 0
    );

    // Play the game 5 times (mount → wait → unmount)
    for (let i = 0; i < 5; i++) {
      // Click the game in the catalog
      await page.click(`[data-game-id="${gameId}"]`);

      // Wait for game to mount
      await page.waitForSelector('.game-container canvas');

      // Play for 3 seconds
      await page.waitForTimeout(3000);

      // Click back button to unmount
      await page.click('.back-button');

      // Wait for unmount to complete
      await page.waitForSelector('.game-container', { state: 'hidden' });
    }

    // Force GC if available
    await page.evaluate(() => {
      if ((globalThis as any).gc) (globalThis as any).gc();
    });

    // Check memory after 5 cycles
    const after = await page.evaluate(() =>
      (performance as any).memory?.usedJSHeapSize ?? 0
    );

    // Memory should not grow by more than 5MB after 5 mount/unmount cycles
    // (Some growth is normal due to V8 internals, but leaks show as steady growth)
    const growthMB = (after - baseline) / 1048576;
    console.log(`[${gameId}] Memory growth after 5 cycles: ${growthMB.toFixed(1)} MB`);

    // Allow 5MB tolerance for V8 heap fragmentation
    expect(growthMB).toBeLessThan(5);

    // Check for leftover canvas elements
    const canvasCount = await page.evaluate(() =>
      document.querySelectorAll('canvas').length
    );
    expect(canvasCount).toBe(0);
  });
}
```

### Visual Regression Test

```typescript
// e2e/visual-regression.test.ts

import { test, expect } from '@playwright/test';

const GAME_IDS = ['tic-tac-toe', 'snake', 'flappy-bird'];

for (const gameId of GAME_IDS) {
  test(`visual regression: ${gameId}`, async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Launch the game
    await page.click(`[data-game-id="${gameId}"]`);
    await page.waitForSelector('.game-container canvas');

    // Wait for the first frame to render
    await page.waitForTimeout(1000);

    // Take a screenshot
    const canvas = page.locator('.game-container canvas');
    await expect(canvas).toHaveScreenshot(`${gameId}-initial.png`, {
      maxDiffPixelRatio: 0.01, // Allow 1% pixel difference
    });
  });
}
```

### Test Configuration (Vitest)

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Required for DOM APIs
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Game integration tests may need longer timeouts
    testTimeout: 10000,
    coverage: {
      include: ['src/games/**', 'src/shared/**', 'src/registry/**'],
    },
  },
});
```

```typescript
// src/test/setup.ts

import { vi } from 'vitest';

// Mock WebAudio API (not available in jsdom)
class MockAudioContext {
  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  decodeAudioData() {
    return Promise.resolve({ duration: 1 });
  }
  close() { return Promise.resolve(); }
}

(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).webkitAudioContext = MockAudioContext;

// Mock ResizeObserver (not available in jsdom)
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock requestAnimationFrame
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
  setTimeout(() => cb(Date.now()), 16);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);

// Mock performance.memory (Chrome-only API)
if (!(performance as any).memory) {
  (performance as any).memory = {
    usedJSHeapSize: 50 * 1048576,
    totalJSHeapSize: 100 * 1048576,
    jsHeapSizeLimit: 500 * 1048576,
  };
}
```

---

## Appendix: Quick Reference Card

### Engine Selection Decision Tree

```
Is the game primarily logic/state-based with simple rendering?
├── Yes → Plain Canvas (Chess, Sudoku, 2048, Tic-Tac-Toe)
└── No ↓
    Does the game need sprites, physics, or particle effects?
    ├── No → Kaboom.js (Snake, Flappy Bird, Pong, Breakout)
    └── Yes → Phaser 3 (Platformer, Space Invaders, RPG)
```

### Unmount Checklist (Copy-Paste for Every Game)

```typescript
unmount(): void {
  cancelAnimationFrame(this.animFrameId);          // ✅ Stop render loop
  clearInterval(this.intervalId);                   // ✅ Stop timers
  clearTimeout(this.timeoutId);                     // ✅ Stop timeouts
  this.resizeObserver?.disconnect();                // ✅ Stop observers
  this.phaserGame?.destroy(true, false);            // ✅ Destroy Phaser
  this.kCtx = null;                                 // ✅ Release Kaboom
  window.removeEventListener('keydown', this.boundKey); // ✅ Remove global listeners
  this.canvas?.removeEventListener('click', this.boundClick);
  this.utilities?.sound.dispose();                  // ✅ Release audio
  this.utilities?.input.dispose();                  // ✅ Release input
  this.container && (this.container.innerHTML = ''); // ✅ Clear DOM
  this.canvas = null;                               // ✅ Null canvas ref
  this.ctx = null;                                  // ✅ Null context ref
  this.container = null;                            // ✅ Null container ref
  this.options = null;                              // ✅ Null options ref
}
```

### Bundle Size Budget Per Engine Tier

| Tier | Engine Chunk | Game Code | Assets | Total (First Load) |
|------|-------------|-----------|--------|-------------------|
| Canvas | 0 KB | 5–20 KB | 0–50 KB | 5–70 KB |
| Kaboom | 45 KB (shared) | 5–15 KB | 10–100 KB | 60–160 KB |
| Phaser | 350 KB (shared) | 10–50 KB | 50–500 KB | 410–900 KB |

**Note:** Kaboom and Phaser engine chunks are shared across all games of that tier. The *incremental* cost of adding a second Phaser game is only the game code + assets (~60–550 KB), not the engine chunk again.

---

*End of report. This document should be updated as new engines are evaluated or as integration patterns evolve based on production experience.*
