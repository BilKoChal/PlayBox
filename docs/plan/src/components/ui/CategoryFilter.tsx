/**
 * CategoryFilter — Horizontal scroll pills for 8 game categories
 *
 * Standalone component extracted from HomePage for reuse.
 * Shows "All Games" + 8 category pills in a horizontal scrollable row.
 * Active category is highlighted with the category's accent color.
 */

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

  return (
    <div className={className}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* All Games pill */}
        <button
          onClick={() => onSelect(null)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
            font-[var(--font-body)] transition-all duration-200 touch-target
            ${!selected
              ? 'bg-[var(--color-primary)] text-[var(--color-text)] shadow-[var(--shadow-sm)] scale-105'
              : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-primary)]'
            }
          `}
        >
          All Games
        </button>

        {/* Category pills */}
        {allCategories.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
                font-[var(--font-body)] transition-all duration-200 touch-target
                flex items-center gap-1.5
                ${isActive
                  ? `${cat.bgColor} ${cat.color} border-2 border-current shadow-[var(--shadow-sm)] scale-105`
                  : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-primary)]'
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
