/**
 * Breakout — PlayBox Game Implementation
 *
 * Classic Breakout game with 3 difficulty levels using Kaboom.js v3000+.
 * - Easy: Wide paddle, slow ball, 4 rows, 5 lives
 * - Medium: Standard paddle, normal ball, 6 rows, 3 lives
 * - Hard: Narrow paddle, fast ball, 8 rows, 2 lives
 *
 * Engine: Kaboom.js (~40KB shared chunk)
 * Category: Arcade
 * Scoring: Points-based (higher is better)
 */

import type { PlayBoxGame, GameMetadata, MountOptions, Difficulty } from '@/types/game';
import { GameCategory, EngineType, Difficulty as Diff } from '@/types/game';

// ============================================
// Difficulty Parameters
// ============================================

interface BreakoutParams {
  paddleWidth: number;
  ballSpeed: number;
  ballRadius: number;
  brickRows: number;
  lives: number;
  speedIncrease: number; // % per 30 seconds
  maxSpeedMultiplier: number;
}

const DIFFICULTY_PARAMS: Record<Difficulty, BreakoutParams> = {
  [Diff.Easy]: {
    paddleWidth: 160,
    ballSpeed: 200,
    ballRadius: 10,
    brickRows: 4,
    lives: 5,
    speedIncrease: 0.03,
    maxSpeedMultiplier: 1.3,
  },
  [Diff.Medium]: {
    paddleWidth: 120,
    ballSpeed: 300,
    ballRadius: 8,
    brickRows: 6,
    lives: 3,
    speedIncrease: 0.05,
    maxSpeedMultiplier: 1.5,
  },
  [Diff.Hard]: {
    paddleWidth: 80,
    ballSpeed: 400,
    ballRadius: 6,
    brickRows: 8,
    lives: 2,
    speedIncrease: 0.08,
    maxSpeedMultiplier: 1.8,
  },
};

// Brick colors (rainbow rows, top to bottom)
const BRICK_COLORS = [
  [239, 71, 111],   // Cherry Red
  [255, 140, 66],   // Tangerine
  [255, 184, 48],   // Sunshine
  [107, 203, 119],  // Mint Green
  [77, 168, 218],   // Candy Blue
  [155, 93, 229],   // Grape Purple
  [239, 71, 111],   // Cherry Red (repeat for 7-8 rows)
  [255, 140, 66],   // Tangerine
];

const BRICK_POINTS = [60, 50, 40, 30, 20, 10, 60, 50];

// ============================================
// Game Metadata
// ============================================

const metadata: GameMetadata = {
  id: 'breakout',
  name: 'Breakout',
  description: 'Bounce the ball to break all the bricks — don\'t let it fall!',
  longDescription:
    'Move the paddle left and right to bounce the ball upward. Break all the colorful bricks to win! Different colored bricks are worth different points. You have multiple lives, but if the ball falls below the paddle, you lose one. Click or tap to launch the ball.',
  category: GameCategory.Arcade,
  engine: EngineType.Kaboom,
  difficulties: [Diff.Easy, Diff.Medium, Diff.Hard],
  defaultDifficulty: Diff.Medium,
  tags: ['breakout', 'arcade', 'classic', 'bricks', 'paddle', 'ball', 'retro'],
  thumbnail: '/games/breakout/thumbnail.png',
  assetsPath: '/games/breakout/',
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

const breakoutGame: PlayBoxGame = {
  metadata,

  mount(options: MountOptions): void {
    const { container, difficulty, callbacks, utilities } = options;
    const params = DIFFICULTY_PARAMS[difficulty];

    // Register sounds (procedural)
    utilities.soundManager.registerSounds('breakout', {
      'hit-brick': { category: 'game', volume: 0.7 },
      'hit-paddle': { category: 'game', volume: 0.6 },
      'hit-wall': { category: 'game', volume: 0.3 },
      'lose-life': { category: 'game', volume: 0.8 },
      'win-complete': { category: 'game', volume: 1.0 },
      'die-lose': { category: 'game', volume: 0.9 },
    });

    // Dynamic import Kaboom (code-split chunk)
    import('kaboom').then((kaboomModule) => {
      const kaboom = kaboomModule.default;

      const GAME_W = 800;
      const GAME_H = 450;

      const k = kaboom({
        canvas: document.createElement('canvas'),
        width: GAME_W,
        height: GAME_H,
        background: [26, 26, 46], // Deep navy
        global: false,
        debug: false,
        crisp: false,
        stretch: true,
        letterbox: true,
      });

      // Append canvas
      const kaboomCanvas = k.canvas;
      kaboomCanvas.style.width = '100%';
      kaboomCanvas.style.height = '100%';
      kaboomCanvas.style.objectFit = 'contain';
      kaboomCanvas.style.touchAction = 'none';
      container.appendChild(kaboomCanvas);

      // ---- Constants ----
      const BRICK_COLS = 10;
      const BRICK_W = 70;
      const BRICK_H = 22;
      const BRICK_GAP = 4;
      const BRICK_OFFSET_X = (GAME_W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;
      const BRICK_OFFSET_Y = 50;
      const PADDLE_H = 14;
      const PADDLE_Y = GAME_H - 40;
      const PADDLE_SPEED = 500;

      // ---- Game State ----
      type GamePhase = 'idle' | 'playing' | 'game_over' | 'level_complete';
      let phase: GamePhase = 'idle';
      let score = 0;
      let lives = params.lives;
      let level = 1;
      let speedMultiplier = 1;
      let paused = false;
      let bricksRemaining = 0;

      // ---- Define Scenes ----
      k.scene('game', () => {
        // Reset
        score = 0;
        lives = params.lives;
        level = 1;
        speedMultiplier = 1;
        phase = 'idle';
        bricksRemaining = 0;

        callbacks.onScoreUpdate(0);

        // ---- Create Paddle ----
        const paddle = k.add([
          k.rect(params.paddleWidth, PADDLE_H, { radius: 7 }),
          k.pos(GAME_W / 2, PADDLE_Y),
          k.anchor('center'),
          k.area(),
          k.color(255, 184, 48), // Sunshine Yellow
          k.outline(2, k.rgb(224, 158, 0)),
          'paddle',
        ]);

        // ---- Create Ball ----
        const ballSpeed = params.ballSpeed;
        const ball = k.add([
          k.circle(params.ballRadius),
          k.pos(GAME_W / 2, PADDLE_Y - PADDLE_H / 2 - params.ballRadius),
          k.anchor('center'),
          k.area(),
          k.color(255, 255, 255),
          'ball',
          {
            vel: k.vec2(0, 0),
            stuck: true, // Ball sits on paddle until launched
          },
        ]);

        // ---- Create Bricks ----
        function createBricks() {
          // Destroy existing bricks
          k.get('brick').forEach((b) => k.destroy(b));

          bricksRemaining = 0;
          for (let row = 0; row < params.brickRows; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
              const colorIdx = row % BRICK_COLORS.length;
              const bx = BRICK_OFFSET_X + col * (BRICK_W + BRICK_GAP) + BRICK_W / 2;
              const by = BRICK_OFFSET_Y + row * (BRICK_H + BRICK_GAP) + BRICK_H / 2;

              k.add([
                k.rect(BRICK_W, BRICK_H, { radius: 4 }),
                k.pos(bx, by),
                k.anchor('center'),
                k.area(),
                k.color(BRICK_COLORS[colorIdx][0], BRICK_COLORS[colorIdx][1], BRICK_COLORS[colorIdx][2]),
                k.outline(1, k.rgb(0, 0, 0)),
                'brick',
                { row, col, points: BRICK_POINTS[row % BRICK_POINTS.length] ?? 10, colorIdx },
              ]);
              bricksRemaining++;
            }
          }
        }

        createBricks();

        // ---- Particles ----
        let particles: {
          x: number; y: number;
          vx: number; vy: number;
          life: number;
          color: number[];
        }[] = [];

        function spawnBrickParticles(bx: number, by: number, color: number[]) {
          for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 80;
            particles.push({
              x: bx, y: by,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0.5,
              color,
            });
          }
        }

        // ---- Input: Launch Ball ----
        function launchBall() {
          if ((ball as any).stuck) {
            const angle = -90 + (Math.random() * 60 - 30); // -120 to -60 degrees (upward)
            const rad = (angle * Math.PI) / 180;
            const speed = ballSpeed * speedMultiplier;
            (ball as any).vel = k.vec2(Math.cos(rad) * speed, Math.sin(rad) * speed);
            (ball as any).stuck = false;
            if (phase === 'idle') phase = 'playing';
          }
        }

        k.onKeyPress('space', launchBall);
        k.onClick(launchBall);
        k.onTouchStart(() => { launchBall(); });

        // ---- Input: Paddle Movement ----
        k.onUpdate(() => {
          if (paused) return;

          // Mouse/touch: paddle follows X
          if (k.isMouseDown()) {
            paddle.pos.x = k.mousePos().x;
          }

          // Keyboard
          if (k.isKeyDown('left') || k.isKeyDown('a')) {
            paddle.pos.x -= PADDLE_SPEED * k.dt();
          }
          if (k.isKeyDown('right') || k.isKeyDown('d')) {
            paddle.pos.x += PADDLE_SPEED * k.dt();
          }

          // Clamp paddle
          const halfPW = params.paddleWidth / 2;
          paddle.pos.x = Math.max(halfPW, Math.min(GAME_W - halfPW, paddle.pos.x));

          // If ball is stuck, follow paddle
          if ((ball as any).stuck) {
            ball.pos.x = paddle.pos.x;
            ball.pos.y = PADDLE_Y - PADDLE_H / 2 - params.ballRadius;
          }
        });

        // ---- Ball Physics ----
        k.onUpdate(() => {
          if (paused || phase !== 'playing') return;
          if ((ball as any).stuck) return;

          const vel = (ball as any).vel as ReturnType<typeof k.vec2>;
          ball.move(vel.x * k.dt(), vel.y * k.dt());

          // Wall collisions
          if (ball.pos.x - params.ballRadius <= 0) {
            ball.pos.x = params.ballRadius;
            (ball as any).vel.x = Math.abs((ball as any).vel.x);
            utilities.soundManager.play('hit-wall', 'game', 0.3);
          }
          if (ball.pos.x + params.ballRadius >= GAME_W) {
            ball.pos.x = GAME_W - params.ballRadius;
            (ball as any).vel.x = -Math.abs((ball as any).vel.x);
            utilities.soundManager.play('hit-wall', 'game', 0.3);
          }
          if (ball.pos.y - params.ballRadius <= 0) {
            ball.pos.y = params.ballRadius;
            (ball as any).vel.y = Math.abs((ball as any).vel.y);
            utilities.soundManager.play('hit-wall', 'game', 0.3);
          }

          // Ball fell below paddle
          if (ball.pos.y - params.ballRadius > GAME_H) {
            lives--;
            utilities.soundManager.play('lose-life', 'game');

            if (lives <= 0) {
              phase = 'game_over';
              utilities.soundManager.play('die-lose', 'game');
              callbacks.onGameOver(score);
            } else {
              // Reset ball on paddle
              (ball as any).stuck = true;
              (ball as any).vel = k.vec2(0, 0);
              ball.pos.x = paddle.pos.x;
              ball.pos.y = PADDLE_Y - PADDLE_H / 2 - params.ballRadius;
            }
          }
        });

        // ---- Collisions ----
        ball.onCollide('paddle', () => {
          const vel = (ball as any).vel as ReturnType<typeof k.vec2>;
          // Calculate reflection based on hit position
          const offset = ball.pos.x - paddle.pos.x;
          const normalizedOffset = offset / (params.paddleWidth / 2);
          const maxAngle = 60;
          const angle = normalizedOffset * maxAngle;
          const currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
          const speed = Math.max(currentSpeed, ballSpeed * speedMultiplier);
          const rad = ((-90 + angle) * Math.PI) / 180;

          (ball as any).vel = k.vec2(
            Math.cos(rad) * speed,
            Math.sin(rad) * speed,
          );

          // Ensure ball goes upward
          if ((ball as any).vel.y > 0) {
            (ball as any).vel.y = -(ball as any).vel.y;
          }

          // Nudge ball above paddle
          ball.pos.y = PADDLE_Y - PADDLE_H / 2 - params.ballRadius;

          utilities.soundManager.play('hit-paddle', 'game');
        });

        ball.onCollide('brick', (brick: any) => {
          // Bounce ball based on collision displacement
          // Simple bounce: flip Y direction
          (ball as any).vel.y = -(ball as any).vel.y;

          // Score
          const pts = brick.points ?? 10;
          score += pts;
          callbacks.onScoreUpdate(score);

          // Particles
          spawnBrickParticles(brick.pos.x, brick.pos.y, BRICK_COLORS[brick.colorIdx ?? 0] ?? [255, 255, 255]);

          // Destroy brick
          k.destroy(brick);
          bricksRemaining--;

          utilities.soundManager.play('hit-brick', 'game');

          // Check level complete
          if (bricksRemaining <= 0) {
            phase = 'level_complete';
            utilities.soundManager.play('win-complete', 'game');

            // Next level
            level++;
            speedMultiplier = Math.min(params.maxSpeedMultiplier, speedMultiplier + params.speedIncrease);

            k.wait(1.5, () => {
              createBricks();
              (ball as any).stuck = true;
              (ball as any).vel = k.vec2(0, 0);
              ball.pos.x = paddle.pos.x;
              ball.pos.y = PADDLE_Y - PADDLE_H / 2 - params.ballRadius;
              phase = 'playing';
            });
          }
        });

        // ---- Particle Update ----
        k.onUpdate(() => {
          particles = particles.filter((p) => {
            p.life -= k.dt();
            p.x += p.vx * k.dt();
            p.y += p.vy * k.dt();
            p.vy += 100 * k.dt(); // Gravity
            return p.life > 0;
          });
        });

        // ---- Drawing ----
        k.onDraw(() => {
          // Particles
          for (const p of particles) {
            k.drawCircle({
              pos: k.vec2(p.x, p.y),
              radius: 3 * (p.life / 0.5),
              color: k.rgb(p.color[0], p.color[1], p.color[2]),
              opacity: p.life / 0.5,
            });
          }

          // Lives display
          let livesText = '';
          for (let i = 0; i < params.lives; i++) {
            livesText += i < lives ? '❤️' : '🖤';
          }
          k.drawText({
            text: livesText,
            pos: k.vec2(GAME_W - 10, 20),
            size: 20,
            anchor: 'topright',
            font: 'sans-serif',
          });

          // Level display
          k.drawText({
            text: `Level ${level}`,
            pos: k.vec2(10, 20),
            size: 16,
            color: k.rgb(160, 160, 184),
            font: 'sans-serif',
          });

          // Idle overlay
          if (phase === 'idle') {
            k.drawRect({
              pos: k.vec2(GAME_W / 2, GAME_H / 2),
              width: GAME_W,
              height: GAME_H,
              color: k.rgb(26, 26, 46),
              opacity: 0.6,
              anchor: 'center',
            });
            k.drawText({
              text: 'Click or tap to launch the ball!',
              pos: k.vec2(GAME_W / 2, GAME_H / 2 - 15),
              size: 24,
              color: k.rgb(240, 240, 245),
              anchor: 'center',
              font: 'sans-serif',
            });
            k.drawText({
              text: '🎮',
              pos: k.vec2(GAME_W / 2, GAME_H / 2 + 25),
              size: 40,
              anchor: 'center',
            });
          }

          // Game over overlay
          if (phase === 'game_over') {
            k.drawRect({
              pos: k.vec2(GAME_W / 2, GAME_H / 2),
              width: GAME_W,
              height: GAME_H,
              color: k.rgb(26, 26, 46),
              opacity: 0.8,
              anchor: 'center',
            });
            k.drawText({
              text: `Great game! Score: ${score.toLocaleString()}`,
              pos: k.vec2(GAME_W / 2, GAME_H / 2 - 15),
              size: 26,
              color: k.rgb(240, 240, 245),
              anchor: 'center',
              font: 'sans-serif',
            });
            k.drawText({
              text: '🌟',
              pos: k.vec2(GAME_W / 2, GAME_H / 2 + 25),
              size: 44,
              anchor: 'center',
            });
          }

          // Paused overlay
          if (paused) {
            k.drawRect({
              pos: k.vec2(GAME_W / 2, GAME_H / 2),
              width: GAME_W,
              height: GAME_H,
              color: k.rgb(26, 26, 46),
              opacity: 0.7,
              anchor: 'center',
            });
            k.drawText({
              text: '⏸ PAUSED',
              pos: k.vec2(GAME_W / 2, GAME_H / 2),
              size: 32,
              color: k.rgb(240, 240, 245),
              anchor: 'center',
              font: 'sans-serif',
            });
          }
        });
      });

      // Cleanup scene
      k.scene('___cleanup___', () => {});

      // Start
      k.go('game');

      // Store context
      (container as any).__kaboom_ctx = k;
    }).catch((err) => {
      console.error('Failed to load Kaboom for Breakout:', err);
    });
  },

  unmount(): void {
    const container = (breakoutGame as any).__lastContainer as HTMLElement | undefined;
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
    const container = (breakoutGame as any).__lastContainer as HTMLElement | undefined;
    if (container) {
      const k = (container as any).__kaboom_ctx;
      if (k) {
        try { k.debug.pause(); } catch {}
      }
    }
  },

  resume(): void {
    const container = (breakoutGame as any).__lastContainer as HTMLElement | undefined;
    if (container) {
      const k = (container as any).__kaboom_ctx;
      if (k) {
        try { k.debug.resume(); } catch {}
      }
    }
  },
};

// Patch mount to store container reference
const originalMount = breakoutGame.mount.bind(breakoutGame);
breakoutGame.mount = function (options: MountOptions) {
  (breakoutGame as any).__lastContainer = options.container;
  originalMount(options);
};

export default breakoutGame;
