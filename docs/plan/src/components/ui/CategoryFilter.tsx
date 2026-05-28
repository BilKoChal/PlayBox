/**
 * CategoryFilter — Horizontal scroll pills for 8 game categories
 *
 * Phase 1.3 Polish:
 * - Pill bounce animation on selection
 * - Smooth scale transition
 * - Active pill glow in dark mode
 * - Better visual feedback with shadow
 */

import { useState, useCallback } from 'react';
import type { GameCategory } from '@/types/game';
import { CATEGORIES } from '@/types/game';

interface CategoryFilterProps {
  selected: GameCategory | null;
  onSelect: (category: GameCategory | null) => void;
  className?: string;
}

export default function CategoryFilter({
  selected,
  onSelect,
  className = '',
}: CategoryFilterProps) {
  const allCategories = Object.values(CATEGORIES);
  const [bouncingKey, setBouncingKey] = useState<string | null>(null);

  const handleSelect = useCallback(
    (catId: GameCategory | null) => {
      // Trigger bounce animation on the selected pill
      setBouncingKey(catId ?? 'all');
      setTimeout(() => setBouncingKey(null), 300);
      onSelect(catId);
    },
    [onSelect],
  );

  return (
    <div className={className}>
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        role="tablist"
        aria-label="Game categories"
      >
        {/* All Games pill */}
        <button
          role="tab"
          aria-selected={!selected}
          onClick={() => handleSelect(null)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
            font-[var(--font-body)] transition-all duration-200 touch-target
            min-h-[40px]
            ${bouncingKey === 'all' ? 'animate-[pillBounce_300ms_ease]' : ''}
            ${!selected
              ? 'bg-[var(--color-primary)] text-[var(--color-text)] shadow-[var(--shadow-md)] scale-105 dark:glow-primary dark:pill-active-glow'
              : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-primary)]/50'
            }
          `}
        >
          🎮 All Games
        </button>

        {/* Category pills */}
        {allCategories.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(isActive ? null : cat.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
                font-[var(--font-body)] transition-all duration-200 touch-target
                flex items-center gap-1.5
                min-h-[40px]
                ${bouncingKey === cat.id ? 'animate-[pillBounce_300ms_ease]' : ''}
                ${isActive
                  ? `${cat.bgColor} ${cat.color} border-2 border-current shadow-[var(--shadow-md)] scale-105 dark:pill-active-glow`
                  : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-primary)]/50'
                }
              `}
            >
              <span className="text-base">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
