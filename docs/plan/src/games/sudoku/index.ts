/**
 * Sudoku — PlayBox Game Implementation
 *
 * A kid-friendly Sudoku game with 3 difficulty levels:
 * - Easy: 4×4 grid (2×2 boxes)
 * - Medium: 6×6 grid (2×3 boxes)
 * - Hard: 9×9 grid (3×3 boxes)
 *
 * Engine: Canvas 2D (zero overhead)
 * Category: Logic/Puzzle
 * Scoring: Time-based (lower is better)
 */

import type { PlayBoxGame, GameMetadata, MountOptions, Difficulty } from '@/types/game';
import { GameCategory, EngineType, Difficulty as Diff } from '@/types/game';
import { SudokuGame } from './SudokuGame';
import { SudokuRenderer } from './SudokuRenderer';
import type { GridConfig } from './types';

// ============================================
// Difficulty Configurations
// ============================================

const DIFFICULTY_CONFIGS: Record<Difficulty, GridConfig> = {
  [Diff.Easy]: {
    size: 4,
    boxRows: 2,
    boxCols: 2,
    minBlanks: 4,
    maxBlanks: 6,
    maxHints: 99, // Unlimited
    showTimer: false,
    autoCheck: true,
    pencilMarks: false,
  },
  [Diff.Medium]: {
    size: 6,
    boxRows: 2,
    boxCols: 3,
    minBlanks: 10,
    maxBlanks: 16,
    maxHints: 5,
    showTimer: true,
    autoCheck: true,
    pencilMarks: true,
  },
  [Diff.Hard]: {
    size: 9,
    boxRows: 3,
    boxCols: 3,
    minBlanks: 30,
    maxBlanks: 38,
    maxHints: 3,
    showTimer: true,
    autoCheck: false,
    pencilMarks: true,
  },
};

// ============================================
// Game Metadata
// ============================================

const metadata: GameMetadata = {
  id: 'sudoku',
  name: 'Sudoku',
  description: 'Fill the grid with numbers — no repeats in any row, column, or box!',
  longDescription:
    'Place numbers 1 through N in the grid so that each row, column, and box contains every number exactly once. Tap a cell, then tap a number to fill it in. Use pencil mode to note candidates, and hints if you get stuck!',
  category: GameCategory.LogicPuzzle,
  engine: EngineType.Canvas,
  difficulties: [Diff.Easy, Diff.Medium, Diff.Hard],
  defaultDifficulty: Diff.Easy,
  tags: ['sudoku', 'puzzle', 'logic', 'numbers', 'grid', 'brain', 'thinking'],
  thumbnail: '/games/sudoku/thumbnail.png',
  assetsPath: '/games/sudoku/',
  supportsKeyboard: true,
  supportsTouch: true,
  supportsGamepad: false,
  minWidth: 320,
  version: '1.0.0',
  author: 'PlayBox',
};

// ============================================
// Game Implementation
// ============================================

let game: SudokuGame | null = null;
let renderer: SudokuRenderer | null = null;
let canvas: HTMLCanvasElement | null = null;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

const sudokuGame: PlayBoxGame = {
  metadata,

  mount(options: MountOptions): void {
    const { container, difficulty, callbacks, utilities } = options;
    const config = DIFFICULTY_CONFIGS[difficulty];

    // Register sounds (procedural only)
    utilities.soundManager.registerSounds('sudoku', {
      'click-tap': { category: 'game', volume: 0.4 },
      'score-point': { category: 'game', volume: 0.6 },
      'win-complete': { category: 'game', volume: 0.8 },
      'move-step': { category: 'game', volume: 0.3 },
    });

    // Create canvas
    canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.cursor = 'pointer';
    canvas.style.touchAction = 'none';
    container.appendChild(canvas);

    // Create game and renderer
    game = new SudokuGame(config);

    renderer = new SudokuRenderer(canvas, game);

    // Start game
    game.start(
      (elapsed) => {
        callbacks.onScoreUpdate(elapsed);
      },
      (finalTime) => {
        callbacks.onGameOver(finalTime);
        utilities.soundManager.play('win-complete', 'game');
      },
      () => {
        renderer?.render();
      },
    );

    renderer.setup(container);
    renderer.render();

    // Focus canvas for keyboard input
    canvas.focus();
  },

  unmount(): void {
    // Cleanup game
    game?.destroy();
    game = null;

    // Cleanup renderer
    renderer?.destroy();
    renderer = null;

    // Remove canvas
    if (canvas) {
      canvas.remove();
      canvas = null;
    }

    // Remove keyboard handler
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
  },

  pause(): void {
    game?.pause();
    renderer?.render();
  },

  resume(): void {
    game?.resume();
    renderer?.render();
  },
};

export default sudokuGame;
