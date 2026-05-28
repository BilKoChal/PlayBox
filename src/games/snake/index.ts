/**
 * Snake — PlayBox Game Implementation
 *
 * Classic Snake game with 3 difficulty levels using Kaboom.js v3000+.
 * - Easy: Slow speed, wall wrap
 * - Medium: Normal speed, wall death
 * - Hard: Fast speed, wall death
 *
 * Engine: Kaboom.js (~40KB shared chunk)
 * Category: Arcade
 * Scoring: Length-based (higher is better)
 */

import type { PlayBoxGame, GameMetadata, MountOptions, Difficulty } from '@/types/game';
import { GameCategory, EngineType, Difficulty as Diff } from '@/types/game';

// ============================================
// Difficulty Parameters
// ============================================

interface SnakeParams {
  tickInterval: number; // seconds between moves
  cols: number;
  rows: number;
  cellSize: number;
  startingLength: number;
  wallBehavior: 'wrap' | 'death';
}

const DIFFICULTY_PARAMS: Record<Difficulty, SnakeParams> = {
  [Diff.Easy]: {
    tickInterval: 0.2,
    cols: 20,
    rows: 15,
    cellSize: 20,
    startingLength: 3,
    wallBehavior: 'wrap',
  },
  [Diff.Medium]: {
    tickInterval: 0.13,
    cols: 20,
    rows: 15,
    cellSize: 20,
    startingLength: 3,
    wallBehavior: 'death',
  },
  [Diff.Hard]: {
    tickInterval: 0.08,
    cols: 20,
    rows: 15,
    cellSize: 20,
    startingLength: 3,
    wallBehavior: 'death',
  },
};

// ============================================
// Game Metadata
// ============================================

const metadata: GameMetadata = {
  id: 'snake',
  name: 'Snake',
  description: 'Guide the snake to eat food and grow longer — don\'t hit the walls or yourself!',
  longDescription:
    'Use arrow keys or WASD to steer the snake. On mobile, swipe in any direction or use the on-screen D-pad. Eat the red apple to grow longer. Avoid crashing into walls (or wrap around on Easy!) and your own tail. How long can you get?',
  category: GameCategory.Arcade,
  engine: EngineType.Kaboom,
  difficulties: [Diff.Easy, Diff.Medium, Diff.Hard],
  defaultDifficulty: Diff.Medium,
  tags: ['snake', 'arcade', 'classic', 'retro', 'growing', 'food'],
  thumbnail: '/games/snake/thumbnail.png',
  assetsPath: '/games/snake/',
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

const snakeGame: PlayBoxGame = {
  metadata,

  mount(options: MountOptions): void {
    const { container, difficulty, callbacks, utilities } = options;
    const params = DIFFICULTY_PARAMS[difficulty];

    // Register sounds (procedural)
    utilities.soundManager.registerSounds('snake', {
      eat: { category: 'game', volume: 0.8 },
      die: { category: 'game', volume: 1.0 },
    });

    // Dynamic import Kaboom (code-split chunk)
    import('kaboom').then((kaboomModule) => {
      const kaboom = kaboomModule.default;

      // Initialize Kaboom inside the container
      const k = kaboom({
        canvas: document.createElement('canvas'),
        width: params.cols * params.cellSize,
        height: params.rows * params.cellSize,
        background: [255, 251, 240], // Warm white #FFFBF0
        global: false,
        debug: false,
        crisp: false,
        stretch: true,
        letterbox: true,
      });

      // Append Kaboom's canvas to container
      const kaboomCanvas = k.canvas;
      kaboomCanvas.style.width = '100%';
      kaboomCanvas.style.height = '100%';
      kaboomCanvas.style.objectFit = 'contain';
      kaboomCanvas.style.touchAction = 'none';
      container.appendChild(kaboomCanvas);

      // ---- Game State ----
      type GameState = 'idle' | 'playing' | 'game_over';
      let gameState: GameState = 'idle';
      let snake: { x: number; y: number }[] = [];
      let direction = { x: 1, y: 0 };
      let directionQueue: { x: number; y: number }[] = [];
      let foodPos = { x: 0, y: 0 };
      let score = params.startingLength;
      let tickTimer = 0;
      let paused = false;
      let particles: { x: number; y: number; vx: number; vy: number; life: number; color: number[] }[] = [];

      // ---- Initialize Snake ----
      function initGame() {
        const startX = Math.floor(params.cols / 2);
        const startY = Math.floor(params.rows / 2);
        snake = [];
        for (let i = 0; i < params.startingLength; i++) {
          snake.push({ x: startX - i, y: startY });
        }
        direction = { x: 1, y: 0 };
        directionQueue = [];
        score = params.startingLength;
        gameState = 'idle';
        tickTimer = 0;
        particles = [];
        spawnFood();
        callbacks.onScoreUpdate(score);
      }

      function spawnFood() {
        const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
        const free: { x: number; y: number }[] = [];
        for (let x = 0; x < params.cols; x++) {
          for (let y = 0; y < params.rows; y++) {
            if (!occupied.has(`${x},${y}`)) {
              free.push({ x, y });
            }
          }
        }
        if (free.length === 0) {
          // Player wins — grid full
          callbacks.onGameOver(score);
          gameState = 'game_over';
          return;
        }
        foodPos = free[Math.floor(Math.random() * free.length)];
      }

      function enqueueDirection(dir: { x: number; y: number }) {
        const lastDir = directionQueue.length > 0
          ? directionQueue[directionQueue.length - 1]
          : direction;

        // Prevent 180° reversal
        if (dir.x === -lastDir.x && dir.y === -lastDir.y) return;
        // Prevent duplicate
        if (dir.x === lastDir.x && dir.y === lastDir.y) return;
        // Buffer max 2
        if (directionQueue.length < 2) {
          directionQueue.push(dir);
        }
      }

      function moveSnake() {
        if (paused || gameState !== 'playing') return;

        // Dequeue direction
        if (directionQueue.length > 0) {
          const next = directionQueue.shift()!;
          if (next.x !== -direction.x || next.y !== -direction.y) {
            direction = next;
          }
        }

        const head = snake[0];
        let newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Wall behavior
        if (params.wallBehavior === 'wrap') {
          newHead.x = ((newHead.x % params.cols) + params.cols) % params.cols;
          newHead.y = ((newHead.y % params.rows) + params.rows) % params.rows;
        } else {
          // Wall death
          if (newHead.x < 0 || newHead.x >= params.cols || newHead.y < 0 || newHead.y >= params.rows) {
            gameOver();
            return;
          }
        }

        // Self collision
        for (const seg of snake) {
          if (seg.x === newHead.x && seg.y === newHead.y) {
            gameOver();
            return;
          }
        }

        // Check food
        const ateFood = newHead.x === foodPos.x && newHead.y === foodPos.y;

        // Add new head
        snake.unshift(newHead);

        if (ateFood) {
          score++;
          callbacks.onScoreUpdate(score);
          utilities.soundManager.play('eat', 'game');
          spawnParticles(newHead.x, newHead.y);
          spawnFood();
        } else {
          // Remove tail (no growth)
          snake.pop();
        }
      }

      function gameOver() {
        gameState = 'game_over';
        utilities.soundManager.play('die', 'game');
        callbacks.onGameOver(score);
      }

      function spawnParticles(gx: number, gy: number) {
        const px = gx * params.cellSize + params.cellSize / 2;
        const py = gy * params.cellSize + params.cellSize / 2;
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 30 + Math.random() * 40;
          particles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.4,
            color: [255, 184, 48], // Sunshine yellow
          });
        }
      }

      // ---- Grid to Pixel ----
      function gridToPixel(gx: number, gy: number) {
        return {
          x: gx * params.cellSize + params.cellSize / 2,
          y: gy * params.cellSize + params.cellSize / 2,
        };
      }

      // ---- Define Scenes ----
      k.scene('game', () => {
        initGame();

        // ---- Input ----
        k.onKeyPress('left', () => {
          if (gameState === 'idle') gameState = 'playing';
          enqueueDirection({ x: -1, y: 0 });
        });
        k.onKeyPress('right', () => {
          if (gameState === 'idle') gameState = 'playing';
          enqueueDirection({ x: 1, y: 0 });
        });
        k.onKeyPress('up', () => {
          if (gameState === 'idle') gameState = 'playing';
          enqueueDirection({ x: 0, y: -1 });
        });
        k.onKeyPress('down', () => {
          if (gameState === 'idle') gameState = 'playing';
          enqueueDirection({ x: 0, y: 1 });
        });
        k.onKeyPress('a', () => enqueueDirection({ x: -1, y: 0 }));
        k.onKeyPress('d', () => enqueueDirection({ x: 1, y: 0 }));
        k.onKeyPress('w', () => enqueueDirection({ x: 0, y: -1 }));
        k.onKeyPress('s', () => enqueueDirection({ x: 0, y: 1 }));

        // Touch/swipe
        let touchStartX = 0;
        let touchStartY = 0;
        k.onTouchStart((pos) => {
          touchStartX = pos.x;
          touchStartY = pos.y;
          if (gameState === 'idle') gameState = 'playing';
        });
        k.onTouchEnd((pos) => {
          const dx = pos.x - touchStartX;
          const dy = pos.y - touchStartY;
          const minSwipe = 20;
          if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;
          if (Math.abs(dx) > Math.abs(dy)) {
            enqueueDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
          } else {
            enqueueDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
          }
        });

        // ---- Game Loop ----
        k.onUpdate(() => {
          if (paused || gameState !== 'playing') return;

          tickTimer += k.dt();
          if (tickTimer >= params.tickInterval) {
            tickTimer -= params.tickInterval;
            moveSnake();
          }

          // Update particles
          particles = particles.filter((p) => {
            p.life -= k.dt();
            p.x += p.vx * k.dt();
            p.y += p.vy * k.dt();
            return p.life > 0;
          });
        });

        // ---- Drawing ----
        k.onDraw(() => {
          const cs = params.cellSize;

          // Grid background lines
          for (let x = 0; x <= params.cols; x++) {
            k.drawLine({
              p1: k.vec2(x * cs, 0),
              p2: k.vec2(x * cs, params.rows * cs),
              width: 1,
              color: k.rgb(223, 230, 233),
            });
          }
          for (let y = 0; y <= params.rows; y++) {
            k.drawLine({
              p1: k.vec2(0, y * cs),
              p2: k.vec2(params.cols * cs, y * cs),
              width: 1,
              color: k.rgb(223, 230, 233),
            });
          }

          // Food (apple)
          if (foodPos) {
            const fp = gridToPixel(foodPos.x, foodPos.y);
            // Apple body
            k.drawCircle({
              pos: k.vec2(fp.x, fp.y + 1),
              radius: (cs - 6) / 2,
              color: k.rgb(239, 71, 111), // Cherry Red
            });
            // Stem
            k.drawRect({
              pos: k.vec2(fp.x - 1, fp.y - cs / 2 + 3),
              width: 2,
              height: 5,
              color: k.rgb(107, 203, 119),
            });
            // Leaf
            k.drawCircle({
              pos: k.vec2(fp.x + 3, fp.y - cs / 2 + 5),
              radius: 2.5,
              color: k.rgb(107, 203, 119),
            });
          }

          // Snake body
          for (let i = snake.length - 1; i >= 0; i--) {
            const seg = snake[i];
            const pp = gridToPixel(seg.x, seg.y);
            const isHead = i === 0;
            const segWidth = cs - 3;
            const segHeight = cs - 3;

            // Color gradient from head to tail
            const t = snake.length > 1 ? i / (snake.length - 1) : 0;
            const r = Math.round(107 - t * 30);
            const g = Math.round(203 - t * 40);
            const b = Math.round(119 - t * 20);

            k.drawRect({
              pos: k.vec2(pp.x, pp.y),
              width: segWidth,
              height: segHeight,
              radius: isHead ? 5 : 3,
              color: k.rgb(r, g, b),
              anchor: 'center',
            });

            // Eyes on head
            if (isHead) {
              const eyeOffsetX = direction.x * 3;
              const eyeOffsetY = direction.y * 3;

              // Left eye
              k.drawCircle({
                pos: k.vec2(pp.x - 3 + eyeOffsetX, pp.y - 2 + eyeOffsetY),
                radius: 3,
                color: k.rgb(255, 255, 255),
              });
              k.drawCircle({
                pos: k.vec2(pp.x - 3 + eyeOffsetX * 1.2, pp.y - 2 + eyeOffsetY * 1.2),
                radius: 1.5,
                color: k.rgb(45, 52, 54),
              });

              // Right eye
              k.drawCircle({
                pos: k.vec2(pp.x + 3 + eyeOffsetX, pp.y - 2 + eyeOffsetY),
                radius: 3,
                color: k.rgb(255, 255, 255),
              });
              k.drawCircle({
                pos: k.vec2(pp.x + 3 + eyeOffsetX * 1.2, pp.y - 2 + eyeOffsetY * 1.2),
                radius: 1.5,
                color: k.rgb(45, 52, 54),
              });
            }
          }

          // Particles
          for (const p of particles) {
            k.drawCircle({
              pos: k.vec2(p.x, p.y),
              radius: 2 * (p.life / 0.4),
              color: k.rgb(p.color[0], p.color[1], p.color[2]),
              opacity: p.life / 0.4,
            });
          }

          // Idle overlay
          if (gameState === 'idle') {
            k.drawRect({
              pos: k.vec2(k.width() / 2, k.height() / 2),
              width: k.width(),
              height: k.height(),
              color: k.rgb(255, 251, 240),
              opacity: 0.7,
              anchor: 'center',
            });
            k.drawText({
              text: 'Press arrow keys or swipe to start!',
              pos: k.vec2(k.width() / 2, k.height() / 2 - 10),
              size: 22,
              color: k.rgb(45, 52, 54),
              anchor: 'center',
              font: 'sans-serif',
            });
            k.drawText({
              text: '🎮',
              pos: k.vec2(k.width() / 2, k.height() / 2 + 20),
              size: 36,
              anchor: 'center',
            });
          }

          // Game over overlay
          if (gameState === 'game_over') {
            k.drawRect({
              pos: k.vec2(k.width() / 2, k.height() / 2),
              width: k.width(),
              height: k.height(),
              color: k.rgb(26, 27, 46),
              opacity: 0.75,
              anchor: 'center',
            });
            k.drawText({
              text: `Nice try! Score: ${score}`,
              pos: k.vec2(k.width() / 2, k.height() / 2 - 10),
              size: 28,
              color: k.rgb(240, 240, 245),
              anchor: 'center',
              font: 'sans-serif',
            });
            k.drawText({
              text: '🐍',
              pos: k.vec2(k.width() / 2, k.height() / 2 + 25),
              size: 40,
              anchor: 'center',
            });
          }

          // Paused overlay
          if (paused) {
            k.drawRect({
              pos: k.vec2(k.width() / 2, k.height() / 2),
              width: k.width(),
              height: k.height(),
              color: k.rgb(26, 27, 46),
              opacity: 0.7,
              anchor: 'center',
            });
            k.drawText({
              text: '⏸ PAUSED',
              pos: k.vec2(k.width() / 2, k.height() / 2),
              size: 32,
              color: k.rgb(240, 240, 245),
              anchor: 'center',
              font: 'sans-serif',
            });
          }
        });
      });

      // Cleanup scene
      k.scene('___cleanup___', () => {
        // Intentionally empty
      });

      // Start the game
      k.go('game');

      // Store kaboom context for cleanup
      (container as any).__kaboom_ctx = k;
    }).catch((err) => {
      console.error('Failed to load Kaboom for Snake:', err);
    });
  },

  unmount(): void {
    const container = (snakeGame as any).__lastContainer as HTMLElement | undefined;
    // Kaboom cleanup: navigate to cleanup scene + null context
    if (container) {
      const k = (container as any).__kaboom_ctx;
      if (k) {
        try {
          k.scene('___cleanup___', () => {});
          k.go('___cleanup___');
        } catch {}
        (container as any).__kaboom_ctx = null;
      }
    }
  },

  pause(): void {
    const container = (snakeGame as any).__lastContainer as HTMLElement | undefined;
    if (container) {
      const k = (container as any).__kaboom_ctx;
      if (k) {
        try {
          k.debug.pause();
        } catch {}
      }
    }
  },

  resume(): void {
    const container = (snakeGame as any).__lastContainer as HTMLElement | undefined;
    if (container) {
      const k = (container as any).__kaboom_ctx;
      if (k) {
        try {
          k.debug.resume();
        } catch {}
      }
    }
  },
};

// Patch mount to store container reference for unmount/pause/resume
const originalMount = snakeGame.mount.bind(snakeGame);
snakeGame.mount = function (options: MountOptions) {
  (snakeGame as any).__lastContainer = options.container;
  originalMount(options);
};

export default snakeGame;
