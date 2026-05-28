# Task 4 — MVP Games (3 Games)

**Phase:** 0.4  
**Date:** 2026-05-28  
**Status:** In Progress

---

## Objective

Implement the first 3 playable games that validate the full PlayBox pipeline:
metadata → lazy import → mount → play → score → unmount.

---

## Games to Implement

### 1. Sudoku (Canvas, Logic/Puzzle)
- **Engine:** Canvas 2D (zero overhead)
- **Category:** Logic/Puzzle
- **Difficulties:** Easy (4×4 grid, 6 blanks), Medium (6×6 grid, 12 blanks), Hard (9×9 grid, 30 blanks)
- **Scoring:** Time-based (lower is better) — ScoreTracker with `scoreType: 'time'`
- **Features:** AI solver for validation, pencil marks, hint system, error highlighting
- **Input:** Keyboard + touch (tap cell, tap number)

### 2. Snake (Kaboom, Arcade)
- **Engine:** Kaboom.js v3000+ (~40KB shared chunk)
- **Category:** Arcade
- **Difficulties:** Easy (slow speed), Medium (normal speed), Hard (fast speed)
- **Scoring:** Length-based (higher is better) — ScoreTracker with `scoreType: 'length'`
- **Features:** Growing snake, food spawning, wall/self collision, sound effects
- **Input:** Keyboard (arrow keys/WASD) + touch (swipe)

### 3. Breakout (Kaboom, Arcade)
- **Engine:** Kaboom.js v3000+ (~40KB shared chunk)
- **Category:** Arcade
- **Difficulties:** Easy (wide paddle, slow ball, 3 rows), Medium (medium paddle, normal ball, 4 rows), Hard (narrow paddle, fast ball, 5 rows)
- **Scoring:** Points-based (higher is better) — ScoreTracker with `scoreType: 'points'`
- **Features:** Paddle, ball, bricks, collision detection, lives system, power-ups
- **Input:** Keyboard (arrow keys) + touch (drag paddle)

---

## Implementation Plan

### Step 1: Research (3 parallel sub-agents)
- Sudoku: Canvas rendering patterns, Sudoku generation algorithms, UI/UX for kids
- Snake: Kaboom.js API, game loop patterns, touch controls
- Breakout: Kaboom.js physics, collision detection, brick layouts

### Step 2: Implement Games
Each game directory will contain:
```
src/games/{game-id}/
├── index.ts          # PlayBoxGame implementation + metadata
├── {game-id}.ts      # Core game logic
├── renderer.ts       # Canvas rendering (Sudoku) or Kaboom setup (Snake/Breakout)
└── types.ts          # Game-specific types
```

### Step 3: Generate Thumbnails
- Use z-ai-generate CLI tool to create game thumbnails
- Save to `public/games/{game-id}/thumbnail.png`
- Each thumbnail: 320x200px, colorful, kid-friendly

### Step 4: Register Games
- Update `src/game-registry.generated.ts` with all 3 games
- Each game gets lazy import + metadata

### Step 5: Build Verification
- `tsc -b` must pass
- `vite build` must pass
- No console errors on game load

---

## PlayBoxGame Interface Contract

Each game must implement:
```typescript
interface PlayBoxGame {
  readonly metadata: GameMetadata;
  mount(options: MountOptions): void;
  unmount(): void;
  pause?(): void;
  resume?(): void;
}
```

Key requirements:
- `mount()`: Create canvas/element, initialize engine, start game loop, set up input, register sounds
- `unmount()`: Stop loops, destroy engine, remove listeners, clear container, unregister sounds
- `pause()`: Freeze game state
- `resume()`: Unfreeze game state
- Must call `callbacks.onScoreUpdate()` when score changes
- Must call `callbacks.onGameOver()` when game ends
- Must use `utilities.soundManager` for all audio
- Must use `utilities.scoreTracker` for score persistence

---

## Dependencies

- Phase 0.3 (Shared Services) must be complete ✅
- PlayBoxGame interface defined in `src/types/game.ts` ✅
- GameWrapper component ready in `src/components/game/GameWrapper.tsx` ✅
- SoundManager, ScoreTracker, PlatformInfo, FullscreenService all available ✅
- Kaboom.js v3000 installed in package.json ✅

---

## File Structure (Expected)

```
src/games/
├── sudoku/
│   ├── index.ts          # PlayBoxGame export + metadata
│   ├── SudokuGame.ts     # Core Sudoku logic (generate, solve, validate)
│   ├── SudokuRenderer.ts # Canvas 2D rendering
│   └── types.ts          # Sudoku-specific types
├── snake/
│   ├── index.ts          # PlayBoxGame export + metadata
│   └── SnakeGame.ts      # Kaboom.js Snake implementation
└── breakout/
    ├── index.ts          # PlayBoxGame export + metadata
    └── BreakoutGame.ts   # Kaboom.js Breakout implementation

public/games/
├── sudoku/
│   └── thumbnail.png
├── snake/
│   └── thumbnail.png
└── breakout/
    └── thumbnail.png
```
