/**
 * DifficultySelector — Select game difficulty level
 *
 * Shows Easy / Medium / Hard pills with emoji and star indicators.
 * Used both in HomePage filters and GamePage difficulty selection.
 * Supports optional "All" option for filtering (show games that support a difficulty).
 */

import { Difficulty, DIFFICULTIES } from '@/types/game';
import type { Difficulty as DifficultyType } from '@/types/game';

interface DifficultySelectorProps {
  /** Currently selected difficulty, or null for "All" */
  selected: DifficultyType | null;
  /** Callback when difficulty changes */
  onSelect: (difficulty: DifficultyType | null) => void;
  /** Available difficulties to show (for game-specific selector) */
  available?: DifficultyType[];
  /** Whether to show "All" option (default: true for filter mode) */
  showAll?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  className?: string;
}

export default function DifficultySelector({
  selected,
  onSelect,
  available,
  showAll = true,
  size = 'sm',
  className = '',
}: DifficultySelectorProps) {
  const difficulties = available || [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {showAll && (
        <button
          onClick={() => onSelect(null)}
          className={`
            ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            rounded-lg font-semibold font-[var(--font-body)]
            transition-all duration-200 touch-target
            ${selected === null
              ? 'bg-[var(--color-primary)] text-[var(--color-text)] shadow-[var(--shadow-sm)]'
              : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
            }
          `}
        >
          All
        </button>
      )}

      {difficulties.map((diff) => {
        const info = DIFFICULTIES[diff];
        const isActive = selected === diff;

        return (
          <button
            key={diff}
            onClick={() => onSelect(isActive && !showAll ? null : diff)}
            className={`
              ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
              rounded-lg font-semibold font-[var(--font-body)]
              transition-all duration-200 touch-target
              flex items-center gap-1
              ${isActive
                ? 'bg-[var(--color-primary)] text-[var(--color-text)] shadow-[var(--shadow-sm)] scale-105'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
              }
            `}
          >
            <span>{info.emoji}</span>
            <span>{info.label}</span>
            <span className="flex items-center gap-px">
              {Array.from({ length: info.stars }, (_, i) => (
                <span key={i} className={isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-primary)]'}>
                  ★
                </span>
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
