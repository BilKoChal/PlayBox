/**
 * SudokuGame — Core Sudoku Logic
 *
 * Handles puzzle generation, solving, and validation.
 * Uses randomized backtracking for generation and
 * a solution counter for uniqueness validation.
 */

import type { GridConfig, CellState, GamePhase } from './types';

export class SudokuGame {
  readonly config: GridConfig;
  private grid: number[][] = [];
  private solution: number[][] = [];
  private cells: CellState[][] = [];
  private phase: GamePhase = 'idle';
  private selectedRow = -1;
  private selectedCol = -1;
  private pencilMode = false;
  private hintsUsed = 0;
  private startTime = 0;
  private elapsedSeconds = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private onScoreUpdate: (score: number) => void = () => {};
  private onGameOver: (score: number) => void = () => {};
  private onRender: () => void = () => {};

  constructor(config: GridConfig) {
    this.config = config;
  }

  // ============================================
  // Game Lifecycle
  // ============================================

  start(
    onScoreUpdate: (score: number) => void,
    onGameOver: (score: number) => void,
    onRender: () => void,
  ): void {
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;
    this.onRender = onRender;

    this.generatePuzzle();
    this.phase = 'idle';
    this.hintsUsed = 0;
    this.elapsedSeconds = 0;
    this.selectedRow = -1;
    this.selectedCol = -1;
    this.pencilMode = false;

    this.onRender();
  }

  destroy(): void {
    this.stopTimer();
  }

  // ============================================
  // Puzzle Generation
  // ============================================

  private generatePuzzle(): void {
    const { size, boxRows, boxCols, minBlanks, maxBlanks } = this.config;

    // Generate complete solution
    this.solution = Array.from({ length: size }, () => Array(size).fill(0));
    this.fillGrid(this.solution, size, boxRows, boxCols);

    // Copy solution to puzzle grid
    this.grid = this.solution.map((row) => [...row]);

    // Remove cells while maintaining unique solution
    const targetBlanks = minBlanks + Math.floor(Math.random() * (maxBlanks - minBlanks + 1));
    const positions: [number, number][] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        positions.push([r, c]);
      }
    }
    this.shuffleArray(positions);

    let blanks = 0;
    for (const [r, c] of positions) {
      if (blanks >= targetBlanks) break;

      const backup = this.grid[r][c];
      this.grid[r][c] = 0;

      // Check if puzzle still has unique solution
      if (this.countSolutions(this.grid, size, boxRows, boxCols, 2) === 1) {
        blanks++;
      } else {
        this.grid[r][c] = backup; // Restore — removing this cell creates multiple solutions
      }
    }

    // Initialize cell states
    this.cells = this.grid.map((row) =>
      row.map((val) => ({
        value: val,
        given: val !== 0,
        hinted: false,
        pencilMarks: new Set<number>(),
        error: false,
      })),
    );
  }

  private fillGrid(
    grid: number[][],
    size: number,
    boxRows: number,
    boxCols: number,
  ): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          const candidates = this.getCandidates(grid, r, c, size, boxRows, boxCols);
          this.shuffleArray(candidates);
          for (const num of candidates) {
            grid[r][c] = num;
            if (this.fillGrid(grid, size, boxRows, boxCols)) {
              return true;
            }
            grid[r][c] = 0;
          }
          return false;
        }
      }
    }
    return true; // All cells filled
  }

  private countSolutions(
    grid: number[][],
    size: number,
    boxRows: number,
    boxCols: number,
    limit: number,
  ): number {
    let count = 0;

    const solve = (g: number[][]): void => {
      if (count >= limit) return;

      // Find first empty cell
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (g[r][c] === 0) {
            const candidates = this.getCandidates(g, r, c, size, boxRows, boxCols);
            for (const num of candidates) {
              g[r][c] = num;
              solve(g);
              if (count >= limit) {
                g[r][c] = 0;
                return;
              }
              g[r][c] = 0;
            }
            return;
          }
        }
      }
      count++;
    };

    const copy = grid.map((row) => [...row]);
    solve(copy);
    return count;
  }

  private getCandidates(
    grid: number[][],
    row: number,
    col: number,
    size: number,
    boxRows: number,
    boxCols: number,
  ): number[] {
    const used = new Set<number>();

    // Row
    for (let c = 0; c < size; c++) {
      if (grid[row][c] !== 0) used.add(grid[row][c]);
    }

    // Column
    for (let r = 0; r < size; r++) {
      if (grid[r][col] !== 0) used.add(grid[r][col]);
    }

    // Box
    const boxStartRow = Math.floor(row / boxRows) * boxRows;
    const boxStartCol = Math.floor(col / boxCols) * boxCols;
    for (let r = boxStartRow; r < boxStartRow + boxRows; r++) {
      for (let c = boxStartCol; c < boxStartCol + boxCols; c++) {
        if (grid[r][c] !== 0) used.add(grid[r][c]);
      }
    }

    const candidates: number[] = [];
    for (let n = 1; n <= size; n++) {
      if (!used.has(n)) candidates.push(n);
    }
    return candidates;
  }

  // ============================================
  // Cell Interaction
  // ============================================

  selectCell(row: number, col: number): void {
    if (row < 0 || row >= this.config.size || col < 0 || col >= this.config.size) {
      this.selectedRow = -1;
      this.selectedCol = -1;
    } else {
      this.selectedRow = row;
      this.selectedCol = col;
    }
    this.onRender();
  }

  placeNumber(num: number): void {
    if (this.selectedRow < 0 || this.selectedCol < 0) return;
    if (this.phase === 'complete') return;

    const cell = this.cells[this.selectedRow][this.selectedCol];
    if (cell.given || cell.hinted) return;

    if (this.phase === 'idle') {
      this.phase = 'playing';
      this.startTimer();
    }

    if (this.pencilMode && this.config.pencilMarks) {
      if (cell.pencilMarks.has(num)) {
        cell.pencilMarks.delete(num);
      } else {
        cell.pencilMarks.add(num);
      }
      cell.value = 0;
      cell.error = false;
    } else {
      cell.value = num;
      cell.pencilMarks.clear();

      if (this.config.autoCheck) {
        this.validateCell(this.selectedRow, this.selectedCol);
      } else {
        cell.error = false;
      }

      // Auto-remove pencil marks in same row/col/box
      this.removePencilMarks(this.selectedRow, this.selectedCol, num);
    }

    this.checkCompletion();
    this.onRender();
  }

  eraseCell(): void {
    if (this.selectedRow < 0 || this.selectedCol < 0) return;
    if (this.phase === 'complete') return;

    const cell = this.cells[this.selectedRow][this.selectedCol];
    if (cell.given || cell.hinted) return;

    cell.value = 0;
    cell.pencilMarks.clear();
    cell.error = false;

    if (this.config.autoCheck) {
      this.revalidateAll();
    }

    this.onRender();
  }

  useHint(): boolean {
    if (this.phase === 'complete') return false;
    if (this.hintsUsed >= this.config.maxHints) return false;

    // Find empty cells
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < this.config.size; r++) {
      for (let c = 0; c < this.config.size; c++) {
        if (this.cells[r][c].value === 0) {
          emptyCells.push([r, c]);
        }
      }
    }

    if (emptyCells.length === 0) return false;

    if (this.phase === 'idle') {
      this.phase = 'playing';
      this.startTimer();
    }

    // Pick a random empty cell
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const cell = this.cells[r][c];
    cell.value = this.solution[r][c];
    cell.hinted = true;
    cell.pencilMarks.clear();
    cell.error = false;
    this.hintsUsed++;

    this.removePencilMarks(r, c, cell.value);
    this.checkCompletion();
    this.onRender();
    return true;
  }

  togglePencilMode(): void {
    this.pencilMode = !this.pencilMode;
    this.onRender();
  }

  // ============================================
  // Validation
  // ============================================

  private validateCell(row: number, col: number): void {
    const cell = this.cells[row][col];
    if (cell.value === 0) {
      cell.error = false;
      return;
    }

    cell.error = this.hasConflict(row, col, cell.value);
  }

  private hasConflict(row: number, col: number, value: number): boolean {
    const { size, boxRows, boxCols } = this.config;

    // Check row
    for (let c = 0; c < size; c++) {
      if (c !== col && this.cells[row][c].value === value) return true;
    }

    // Check column
    for (let r = 0; r < size; r++) {
      if (r !== row && this.cells[r][col].value === value) return true;
    }

    // Check box
    const boxStartRow = Math.floor(row / boxRows) * boxRows;
    const boxStartCol = Math.floor(col / boxCols) * boxCols;
    for (let r = boxStartRow; r < boxStartRow + boxRows; r++) {
      for (let c = boxStartCol; c < boxStartCol + boxCols; c++) {
        if (r !== row && c !== col && this.cells[r][c].value === value) return true;
      }
    }

    return false;
  }

  private revalidateAll(): void {
    for (let r = 0; r < this.config.size; r++) {
      for (let c = 0; c < this.config.size; c++) {
        this.validateCell(r, c);
      }
    }
  }

  private removePencilMarks(row: number, col: number, num: number): void {
    const { size, boxRows, boxCols } = this.config;

    // Row
    for (let c = 0; c < size; c++) {
      this.cells[row][c].pencilMarks.delete(num);
    }

    // Column
    for (let r = 0; r < size; r++) {
      this.cells[r][col].pencilMarks.delete(num);
    }

    // Box
    const boxStartRow = Math.floor(row / boxRows) * boxRows;
    const boxStartCol = Math.floor(col / boxCols) * boxCols;
    for (let r = boxStartRow; r < boxStartRow + boxRows; r++) {
      for (let c = boxStartCol; c < boxStartCol + boxCols; c++) {
        this.cells[r][c].pencilMarks.delete(num);
      }
    }
  }

  private checkCompletion(): void {
    for (let r = 0; r < this.config.size; r++) {
      for (let c = 0; c < this.config.size; c++) {
        const cell = this.cells[r][c];
        if (cell.value === 0) return;
        if (cell.value !== this.solution[r][c]) return;
      }
    }

    // All cells correctly filled
    this.phase = 'complete';
    this.stopTimer();

    // Add hint penalty
    const finalTime = this.elapsedSeconds + this.hintsUsed * 30;
    this.onGameOver(finalTime);
  }

  // ============================================
  // Timer
  // ============================================

  private startTimer(): void {
    this.startTime = Date.now() - this.elapsedSeconds * 1000;
    this.timerInterval = setInterval(() => {
      if (this.phase === 'playing') {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.onScoreUpdate(this.elapsedSeconds);
        this.onRender();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ============================================
  // Pause / Resume
  // ============================================

  pause(): void {
    if (this.phase === 'playing') {
      this.phase = 'paused';
      this.onRender();
    }
  }

  resume(): void {
    if (this.phase === 'paused') {
      this.phase = 'playing';
      this.startTime = Date.now() - this.elapsedSeconds * 1000;
      this.onRender();
    }
  }

  // ============================================
  // State Getters
  // ============================================

  getCells(): CellState[][] {
    return this.cells;
  }

  getPhase(): GamePhase {
    return this.phase;
  }

  getSelectedCell(): { row: number; col: number } {
    return { row: this.selectedRow, col: this.selectedCol };
  }

  isPencilMode(): boolean {
    return this.pencilMode;
  }

  getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  getHintsUsed(): number {
    return this.hintsUsed;
  }

  getHintsRemaining(): number {
    return this.config.maxHints - this.hintsUsed;
  }

  isCellValueComplete(row: number, col: number): boolean {
    const val = this.cells[row]?.[col]?.value;
    if (!val) return false;
    return val === this.solution[row][col];
  }

  // ============================================
  // Utility
  // ============================================

  private shuffleArray<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
