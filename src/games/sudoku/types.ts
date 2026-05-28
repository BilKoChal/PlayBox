/**
 * Sudoku Game Types
 */

export interface GridConfig {
  size: number;
  boxRows: number;
  boxCols: number;
  minBlanks: number;
  maxBlanks: number;
  maxHints: number;
  showTimer: boolean;
  autoCheck: boolean;
  pencilMarks: boolean;
}

export interface CellState {
  value: number;         // 0 = empty
  given: boolean;        // Pre-filled by puzzle
  hinted: boolean;       // Revealed by hint
  pencilMarks: Set<number>; // Candidate numbers
  error: boolean;        // Conflicts with another cell
}

export type GamePhase = 'idle' | 'playing' | 'paused' | 'complete';
