# Worklog — Task 4: MVP Games (3 Games)

**Phase:** 0.4  
**Date:** 2026-05-28  
**Status:** ✅ Complete

---

## Task Summary

Implemented 3 MVP games that validate the full PlayBox pipeline: metadata → lazy import → mount → play → score → unmount.

---

## Work Log

### Step 1: Research (3 parallel sub-agents)
- Dispatched 3 sub-agents to research Sudoku, Snake, and Breakout in parallel
- Each sub-agent produced a comprehensive report covering: UI/UX for kids, art style, coding patterns, Kaboom.js API, game mechanics, difficulty parameters, sound effects, and touch controls

### Step 2: Sudoku Implementation (Canvas, Logic/Puzzle)
- Created `src/games/sudoku/types.ts` — GridConfig, CellState, GamePhase types
- Created `src/games/sudoku/SudokuGame.ts` — Core game logic:
  - Randomized backtracking puzzle generation for 4×4, 6×6, and 9×9 grids
  - Solution counting for uniqueness validation (limit=2)
  - Cell selection, number placement, pencil marks, hints
  - Auto-check validation, error highlighting
  - Timer with pause/resume support
  - Completion detection and callback triggers
- Created `src/games/sudoku/SudokuRenderer.ts` — Canvas 2D rendering:
  - devicePixelRatio-aware crisp rendering
  - Cell backgrounds: alternating boxes, selection highlight, related cells, same number, errors
  - Grid lines: thin cell borders, thick box borders, outer border
  - Numbers: given (bold dark), player (Candy Blue), hinted (gold), error (red)
  - Pencil marks as mini-grid within cells
  - Toolbar: timer, pencil toggle, hint button, erase button
  - Number pad: tap-to-fill with large touch targets
  - Paused and complete overlays
- Created `src/games/sudoku/index.ts` — PlayBoxGame interface implementation:
  - 3 difficulty configs: Easy (4×4, unlimited hints, no timer), Medium (6×6, 5 hints, timer), Hard (9×9, 3 hints, timer)
  - Canvas creation, sound registration, keyboard/touch input handling
  - Time-based scoring (lower is better)

### Step 3: Snake Implementation (Kaboom.js, Arcade)
- Created `src/games/snake/index.ts` — Full Snake game using Kaboom.js v3000+:
  - `global: false` mode with container-based initialization
  - Grid-based movement with tick timer accumulator (not setInterval)
  - Direction queue (max 2 buffered inputs, 180° prevention)
  - Wall wrap on Easy, wall death on Medium/Hard
  - Growing snake with apple food, self-collision detection
  - `onDraw()` rendering: green gradient snake with eyes, red apple with stem/leaf, grid background
  - Particle effects on food eat (sunshine yellow sparkles)
  - Swipe and keyboard (arrow keys + WASD) input
  - Idle, playing, and game_over states with overlays
  - Kaboom cleanup via empty scene navigation + null context
  - Length-based scoring (higher is better)

### Step 4: Breakout Implementation (Kaboom.js, Arcade)
- Created `src/games/breakout/index.ts` — Full Breakout game using Kaboom.js v3000+:
  - Same `global: false` Kaboom pattern as Snake
  - Manual velocity ball physics (not Kaboom body component)
  - Paddle follows mouse/touch position, keyboard left/right as fallback
  - Rainbow brick rows (6+ colors) with different point values
  - Ball-paddle angle-based reflection
  - Ball-wall collision with bouncing
  - Ball-brick collision with Y-velocity flip
  - Lives system with heart display
  - Level progression: speed increases, new bricks
  - Particle effects on brick destruction
  - Idle (ball on paddle), playing, game_over, level_complete states
  - Points-based scoring (higher is better)

### Step 5: Thumbnail Generation
- Generated 3 AI thumbnails using `z-ai-generate` CLI:
  - `public/games/sudoku/thumbnail.png` (1152×864)
  - `public/games/snake/thumbnail.png` (1152×864)
  - `public/games/breakout/thumbnail.png` (1152×864)

### Step 6: Game Registry Update
- Updated `src/game-registry.generated.ts` with all 3 games:
  - Lazy imports: `import('@/games/sudoku/index')`, `import('@/games/snake/index')`, `import('@/games/breakout/index')`
  - Complete metadata for each game
  - `gameMetas` convenience object

### Step 7: Build Verification
- Fixed TypeScript errors:
  - Breakout: spread argument type error (changed to individual RGB args), `isTouching` not on KaboomCtx type (changed to `isMouseDown`), unused `vel` variable
  - SudokuRenderer: unused imports and variables (`GamePhase`, `size` in `getCellBackground`)
- `tsc -b` passes with 0 errors
- `vite build` succeeds: 83 modules, 4.23s build time
  - Game chunks properly code-split: `engine-kaboom` (132KB), games loaded via lazy imports

---

## Files Created

| File | Purpose |
|------|---------|
| `src/games/sudoku/types.ts` | Sudoku-specific types |
| `src/games/sudoku/SudokuGame.ts` | Core Sudoku logic (generation, solving, validation) |
| `src/games/sudoku/SudokuRenderer.ts` | Canvas 2D rendering |
| `src/games/sudoku/index.ts` | PlayBoxGame implementation |
| `src/games/snake/index.ts` | Complete Snake game (Kaboom.js) |
| `src/games/breakout/index.ts` | Complete Breakout game (Kaboom.js) |
| `public/games/sudoku/thumbnail.png` | AI-generated thumbnail |
| `public/games/snake/thumbnail.png` | AI-generated thumbnail |
| `public/games/breakout/thumbnail.png` | AI-generated thumbnail |

## Files Modified

| File | Change |
|------|--------|
| `src/game-registry.generated.ts` | Added all 3 games with lazy imports and metadata |

---

## Key Decisions

1. **Sudoku uses different grid sizes per difficulty** (4×4, 6×6, 9×9) rather than just changing blank count — this is more age-appropriate for kids 4-12
2. **Snake uses wall wrap on Easy** — friendlier for youngest players who don't understand boundaries yet
3. **Breakout uses direct touch-to-paddle mapping** (not drag) — zero learning curve for kids
4. **All games use procedural sounds** — no audio files needed for MVP, SoundManager handles it
5. **Kaboom games use `global: false` mode** — prevents namespace pollution, enables clean unmount
6. **Kaboom cleanup via empty scene + null context** — no official `destroy()` method, this is the safest pattern

---

## Build Results

- TypeScript: ✅ 0 errors
- Vite build: ✅ Success (4.23s, 83 modules)
- Code splitting: ✅ Kaboom chunk (132KB), games lazy-loaded
