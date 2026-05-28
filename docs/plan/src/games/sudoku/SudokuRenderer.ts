/**
 * SudokuRenderer — Canvas 2D Rendering for Sudoku
 *
 * Renders the Sudoku grid, numbers, pencil marks, selection,
 * and animations using HTML5 Canvas.
 */

import type { GridConfig, CellState } from './types';
import type { SudokuGame } from './SudokuGame';

// Color palette matching PlayBox candy theme
const COLORS = {
  // Backgrounds
  bgDefault: '#FFFFFF',
  bgAlternate: '#FFF8E7',
  bgSelected: '#FFE8A8',
  bgRelated: '#FFF4D6',
  bgSameNumber: '#E1F0FA',
  bgError: '#FFD4B8',
  bgHinted: '#FFF0C8',
  bgComplete: '#D4EDDA',

  // Borders
  borderCell: '#D5D5D5',
  borderBox: '#555555',
  borderOuter: '#2D3436',
  borderSelected: '#FFB830',
  borderError: '#FF6B8A',

  // Text
  textGiven: '#2D3436',
  textPlayer: '#4DA8DA',
  textHinted: '#FFB830',
  textPencil: '#A0A0A0',
  textError: '#EF476F',

  // UI
  bgPaused: 'rgba(26, 27, 46, 0.85)',
  textPaused: '#F0F0F5',
  textTimer: '#636E72',
};

export class SudokuRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: SudokuGame;
  private config: GridConfig;
  private logicalSize = 0;
  private cellSize = 0;
  private dpr = 1;

  // Number pad elements
  private numpadContainer: HTMLDivElement | null = null;
  private toolbarContainer: HTMLDivElement | null = null;

  constructor(canvas: HTMLCanvasElement, game: SudokuGame) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.game = game;
    this.config = game.config;
  }

  // ============================================
  // Setup
  // ============================================

  setup(container: HTMLElement): void {
    this.resize();
    this.createToolbar(container);
    this.createNumpad(container);
    this.setupInputHandlers();

    // Listen for resize
    window.addEventListener('resize', this.handleResize);
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.numpadContainer?.remove();
    this.toolbarContainer?.remove();
  }

  private handleResize = (): void => {
    this.resize();
    this.render();
  };

  private resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const maxW = parent.clientWidth;
    const maxH = parent.clientHeight - 120; // Space for numpad + toolbar
    const size = Math.min(maxW, maxH, 600);

    this.cellSize = Math.floor(size / this.config.size);
    this.logicalSize = this.cellSize * this.config.size;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.logicalSize * this.dpr;
    this.canvas.height = this.logicalSize * this.dpr;
    this.canvas.style.width = this.logicalSize + 'px';
    this.canvas.style.height = this.logicalSize + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // ============================================
  // Toolbar
  // ============================================

  private createToolbar(container: HTMLElement): void {
    this.toolbarContainer = document.createElement('div');
    this.toolbarContainer.style.cssText = `
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 4px; gap: 8px; flex-wrap: wrap;
      font-family: 'Quicksand', sans-serif;
    `;

    // Timer
    const timerEl = document.createElement('div');
    timerEl.id = 'sudoku-timer';
    timerEl.style.cssText = `
      font-size: 14px; font-weight: 600; color: ${COLORS.textTimer};
      font-family: 'Nunito', sans-serif;
    `;
    timerEl.textContent = '⏱ 0:00';
    this.toolbarContainer.appendChild(timerEl);

    // Button group
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: flex; gap: 6px;';

    // Pencil toggle
    const pencilBtn = this.createButton('✏️ Pencil', () => {
      this.game.togglePencilMode();
      this.updatePencilButton(pencilBtn);
    });
    pencilBtn.id = 'sudoku-pencil-btn';
    if (!this.config.pencilMarks) pencilBtn.style.display = 'none';
    btnGroup.appendChild(pencilBtn);

    // Hint button
    const hintBtn = this.createButton('💡 Hint', () => {
      this.game.useHint();
      this.render();
    });
    hintBtn.id = 'sudoku-hint-btn';
    btnGroup.appendChild(hintBtn);

    // Erase button
    const eraseBtn = this.createButton('⌫ Erase', () => {
      this.game.eraseCell();
    });
    btnGroup.appendChild(eraseBtn);

    this.toolbarContainer.appendChild(btnGroup);
    container.insertBefore(this.toolbarContainer, this.canvas);
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      padding: 6px 12px; border-radius: 8px; border: 2px solid #DFE6E9;
      background: #FFFFFF; color: #2D3436; font-size: 13px; font-weight: 600;
      cursor: pointer; touch-action: manipulation; min-height: 44px;
      font-family: 'Quicksand', sans-serif;
      transition: background 0.15s, border-color 0.15s;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#FFF3D6';
      btn.style.borderColor = '#FFB830';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#FFFFFF';
      btn.style.borderColor = '#DFE6E9';
    });
    btn.addEventListener('click', onClick);
    return btn;
  }

  private updatePencilButton(btn: HTMLButtonElement): void {
    if (this.game.isPencilMode()) {
      btn.style.background = '#FFB830';
      btn.style.color = '#FFFFFF';
      btn.style.borderColor = '#FFB830';
    } else {
      btn.style.background = '#FFFFFF';
      btn.style.color = '#2D3436';
      btn.style.borderColor = '#DFE6E9';
    }
  }

  // ============================================
  // Number Pad
  // ============================================

  private createNumpad(container: HTMLElement): void {
    this.numpadContainer = document.createElement('div');
    this.numpadContainer.style.cssText = `
      display: flex; flex-wrap: wrap; justify-content: center;
      gap: 6px; padding: 8px 4px;
    `;

    const { size } = this.config;

    // Number buttons
    for (let n = 1; n <= size; n++) {
      const btn = document.createElement('button');
      btn.textContent = String(n);
      btn.dataset.num = String(n);
      btn.style.cssText = `
        width: 48px; height: 48px; border-radius: 12px; border: none;
        background: #4DA8DA; color: #FFFFFF; font-size: 20px; font-weight: 700;
        cursor: pointer; touch-action: manipulation;
        font-family: 'Nunito', sans-serif;
        transition: transform 0.1s, background 0.1s;
      `;
      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
      });
      btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1)';
      });
      btn.addEventListener('click', () => {
        this.game.placeNumber(n);
      });
      this.numpadContainer.appendChild(btn);
    }

    container.appendChild(this.numpadContainer);
  }

  // ============================================
  // Input Handlers
  // ============================================

  private setupInputHandlers(): void {
    // Canvas click/tap
    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.logicalSize / rect.width;
      const scaleY = this.logicalSize / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);

      if (row >= 0 && row < this.config.size && col >= 0 && col < this.config.size) {
        this.game.selectCell(row, col);
        this.render();
      }
    });

    // Keyboard input
    const handleKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= this.config.size) {
        this.game.placeNumber(num);
        return;
      }

      switch (e.key) {
        case 'Backspace':
        case 'Delete':
        case '0':
          this.game.eraseCell();
          break;
        case 'ArrowUp':
          this.moveSelection(-1, 0);
          e.preventDefault();
          break;
        case 'ArrowDown':
          this.moveSelection(1, 0);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          this.moveSelection(0, -1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.moveSelection(0, 1);
          e.preventDefault();
          break;
        case 'p':
        case 'P':
          this.game.togglePencilMode();
          const btn = document.getElementById('sudoku-pencil-btn');
          if (btn) this.updatePencilButton(btn as HTMLButtonElement);
          break;
        case 'h':
        case 'H':
          this.game.useHint();
          break;
      }
    };

    this.canvas.addEventListener('keydown', handleKey);
    // Make canvas focusable for keyboard events
    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none';
    this.canvas.addEventListener('focus', () => { /* focused */ });
  }

  private moveSelection(dRow: number, dCol: number): void {
    const { row, col } = this.game.getSelectedCell();
    const newRow = Math.max(0, Math.min(this.config.size - 1, row + dRow));
    const newCol = Math.max(0, Math.min(this.config.size - 1, col + dCol));
    this.game.selectCell(newRow, newCol);
    this.render();
  }

  // ============================================
  // Rendering
  // ============================================

  render(): void {
    const ctx = this.ctx;
    const { size, boxRows, boxCols } = this.config;
    const cs = this.cellSize;

    ctx.clearRect(0, 0, this.logicalSize, this.logicalSize);

    const cells = this.game.getCells();
    const { row: selRow, col: selCol } = this.game.getSelectedCell();
    const phase = this.game.getPhase();

    // 1. Draw cell backgrounds
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = cells[r][c];
        const x = c * cs;
        const y = r * cs;

        // Determine background color
        let bg = this.getCellBackground(r, c, cell, selRow, selCol);
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, cs, cs);
      }
    }

    // 2. Draw grid lines
    ctx.strokeStyle = COLORS.borderCell;
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * cs + 0.5);
      ctx.lineTo(this.logicalSize, i * cs + 0.5);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(i * cs + 0.5, 0);
      ctx.lineTo(i * cs + 0.5, this.logicalSize);
      ctx.stroke();
    }

    // Box borders
    ctx.strokeStyle = COLORS.borderBox;
    ctx.lineWidth = 3;
    for (let boxR = 0; boxR < size / boxRows; boxR++) {
      for (let boxC = 0; boxC < size / boxCols; boxC++) {
        const x = boxC * boxCols * cs;
        const y = boxR * boxRows * cs;
        const w = boxCols * cs;
        const h = boxRows * cs;
        ctx.strokeRect(x + 0.5, y + 0.5, w, h);
      }
    }

    // Outer border
    ctx.strokeStyle = COLORS.borderOuter;
    ctx.lineWidth = 4;
    ctx.strokeRect(1, 1, this.logicalSize - 2, this.logicalSize - 2);

    // 3. Draw selection highlight
    if (selRow >= 0 && selCol >= 0) {
      ctx.strokeStyle = COLORS.borderSelected;
      ctx.lineWidth = 3;
      ctx.strokeRect(selCol * cs + 1, selRow * cs + 1, cs - 2, cs - 2);
    }

    // 4. Draw numbers
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = cells[r][c];
        const cx = c * cs + cs / 2;
        const cy = r * cs + cs / 2;

        if (cell.value !== 0) {
          // Draw number
          let color = COLORS.textPlayer;
          let weight = '600';
          if (cell.given) {
            color = COLORS.textGiven;
            weight = '700';
          } else if (cell.hinted) {
            color = COLORS.textHinted;
            weight = '600';
          } else if (cell.error) {
            color = COLORS.textError;
            weight = '600';
          }

          ctx.fillStyle = color;
          ctx.font = `${weight} ${cs * 0.5}px "Nunito", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(cell.value), cx, cy + 1);
        } else if (cell.pencilMarks.size > 0) {
          // Draw pencil marks
          const pmSize = cs / (boxRows > boxCols ? boxRows : boxCols);
          const pmFontSize = cs * 0.18;
          ctx.fillStyle = COLORS.textPencil;
          ctx.font = `600 ${pmFontSize}px "Nunito", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          for (const num of cell.pencilMarks) {
            const pmRow = Math.floor((num - 1) / boxCols);
            const pmCol = (num - 1) % boxCols;
            const pmX = c * cs + pmCol * pmSize + pmSize / 2;
            const pmY = r * cs + pmRow * pmSize + pmSize / 2;
            ctx.fillText(String(num), pmX, pmY);
          }
        }
      }
    }

    // 5. Update timer
    if (this.config.showTimer) {
      const timerEl = document.getElementById('sudoku-timer');
      if (timerEl) {
        const secs = this.game.getElapsedSeconds();
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        timerEl.textContent = `⏱ ${mins}:${String(s).padStart(2, '0')}`;
      }
    }

    // 6. Paused overlay
    if (phase === 'paused') {
      ctx.fillStyle = COLORS.bgPaused;
      ctx.fillRect(0, 0, this.logicalSize, this.logicalSize);
      ctx.fillStyle = COLORS.textPaused;
      ctx.font = `700 ${cs * 1.5}px "Nunito", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏸ PAUSED', this.logicalSize / 2, this.logicalSize / 2);
    }

    // 7. Complete overlay
    if (phase === 'complete') {
      ctx.fillStyle = 'rgba(107, 203, 119, 0.3)';
      ctx.fillRect(0, 0, this.logicalSize, this.logicalSize);
      ctx.fillStyle = '#2D3436';
      ctx.font = `700 ${cs * 1.2}px "Nunito", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉 Complete!', this.logicalSize / 2, this.logicalSize / 2);
    }
  }

  private getCellBackground(
    r: number,
    c: number,
    cell: CellState,
    selRow: number,
    selCol: number,
  ): string {
    const { boxRows, boxCols } = this.config;

    // Alternating box background
    const boxR = Math.floor(r / boxRows);
    const boxC = Math.floor(c / boxCols);
    const isAlternateBox = (boxR + boxC) % 2 === 1;
    let bg = isAlternateBox ? COLORS.bgAlternate : COLORS.bgDefault;

    if (selRow >= 0 && selCol >= 0) {
      const selCell = this.game.getCells()[selRow]?.[selCol];
      const selValue = selCell?.value;

      // Same row/col/box
      const sameRow = r === selRow;
      const sameCol = c === selCol;
      const sameBox =
        Math.floor(r / boxRows) === Math.floor(selRow / boxRows) &&
        Math.floor(c / boxCols) === Math.floor(selCol / boxCols);

      if (sameRow || sameCol || sameBox) {
        bg = COLORS.bgRelated;
      }

      // Same number highlight
      if (selValue && selValue !== 0 && cell.value === selValue && !(r === selRow && c === selCol)) {
        bg = COLORS.bgSameNumber;
      }

      // Selected cell
      if (r === selRow && c === selCol) {
        bg = COLORS.bgSelected;
      }
    }

    // Error
    if (cell.error) {
      bg = COLORS.bgError;
    }

    // Hinted
    if (cell.hinted) {
      bg = COLORS.bgHinted;
    }

    return bg;
  }
}
