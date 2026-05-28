/**
 * DifficultySelector — Select game difficulty level
 *
 * Phase 1.3 Polish:
 * - Color-coded active states (green/orange/red)
 * - Pill bounce animation on selection
 * - Better shadow and transition effects
 * - Active glow in dark mode
 */

import { useState, useCallback } from 'react';
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

/** Color schemes for each difficulty level */
const DIFFICULTY_COLORS: Record<string, { active: string; darkGlow: string }> = {
  easy: {
    active: 'bg-[var(--color-accent-green)] text-white shadow-[0_2px_8px_rgba(107,203,119,0.3)]',
    darkGlow: 'dark:shadow-[0_0_12px_rgba(142,219,160,0.2)]',
  },
  medium: {
    active: 'bg-[var(--color-accent-orange)] text-white shadow-[0_2px_8px_rgba(255,140,66,0.3)]',
    darkGlow: 'dark:shadow-[0_0_12px_rgba(255,168,104,0.2)]',
  },
  hard: {
    active: 'bg-[var(--color-accent-red)] text-white shadow-[0_2px_8px_rgba(239,71,111,0.3)]',
    darkGlow: 'dark:shadow-[0_0_12px_rgba(240,104,136,0.2)]',
  },
};

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
  const [bouncingKey, setBouncingKey] = useState<string | null>(null);

  const handleSelect = useCallback(
    (diff: DifficultyType | null) => {
      setBouncingKey(diff ?? 'all');
      setTimeout(() => setBouncingKey(null), 300);
      onSelect(diff === selected && !showAll ? null : diff);
    },
    [onSelect, selected, showAll],
  );

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`} role="radiogroup" aria-label="Select difficulty">
      {showAll && (
        <button
          role="radio"
          aria-checked={selected === null}
          onClick={() => handleSelect(null)}
          className={`
            ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            rounded-full font-semibold font-[var(--font-body)]
            transition-all duration-200 touch-target min-h-[36px]
            ${bouncingKey === 'all' ? 'animate-[pillBounce_300ms_ease]' : ''}
            ${selected === null
              ? 'bg-[var(--color-primary)] text-[var(--color-text)] shadow-[var(--shadow-sm)] dark:glow-primary'
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
        const colors = DIFFICULTY_COLORS[diff];

        return (
          <button
            key={diff}
            role="radio"
            aria-checked={isActive}
            onClick={() => handleSelect(diff)}
            className={`
              ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
              rounded-full font-semibold font-[var(--font-body)]
              transition-all duration-200 touch-target min-h-[36px]
              flex items-center gap-1
              ${bouncingKey === diff ? 'animate-[pillBounce_300ms_ease]' : ''}
              ${isActive
                ? `${colors.active} ${colors.darkGlow} scale-105`
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
              }
            `}
          >
            <span>{info.emoji}</span>
            <span>{info.label}</span>
          </button>
        );
      })}
    </div>
  );
}
