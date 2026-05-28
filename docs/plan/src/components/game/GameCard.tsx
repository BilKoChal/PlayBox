/**
 * GameCard — Game card with thumbnail, metadata, and favorite heart
 *
 * Displays game info in the catalog grid:
 * - Thumbnail with category emoji fallback
 * - Engine badge overlay
 * - Category badge + difficulty stars
 * - Game name + description
 * - FavoriteHeart button with particle animation
 * - Play link
 */

import { Link } from 'react-router-dom';
import type { GameMetadata } from '@/types/game';
import { DIFFICULTIES, CATEGORIES } from '@/types/game';
import Badge from '@/components/ui/Badge';
import FavoriteHeart from '@/components/game/FavoriteHeart';

interface GameCardProps {
  game: GameMetadata;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  className?: string;
}

export default function GameCard({
  game,
  isFavorite,
  onToggleFavorite,
  className = '',
}: GameCardProps) {
  const difficultyInfo = DIFFICULTIES[game.defaultDifficulty];
  const categoryInfo = CATEGORIES[game.category];

  return (
    <div
      className={`
        group relative
        bg-[var(--color-bg-card)] rounded-2xl
        border border-[var(--color-border)]
        shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]
        transition-all duration-[var(--transition-base)]
        hover:-translate-y-1
        overflow-hidden
        ${className}
      `}
    >
      {/* Thumbnail */}
      <Link to={`/game/${game.id}`} className="block">
        <div
          className="
            relative aspect-[16/10] bg-gradient-to-br from-[var(--color-bg-hover)]
            to-[var(--color-bg)] overflow-hidden
          "
        >
          {/* Placeholder thumbnail with category emoji/icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300">
              {categoryInfo.emoji}
            </span>
          </div>

          {/* Engine badge */}
          <div className="absolute top-2 right-2">
            <span className="
              px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase
              bg-black/40 text-white backdrop-blur-sm
            ">
              {game.engine}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Category + Difficulty row */}
        <div className="flex items-center justify-between mb-1.5">
          <Badge category={game.category} size="sm" />
          <div className="flex items-center gap-0.5" title={difficultyInfo.label}>
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className={`text-xs ${i < difficultyInfo.stars ? 'text-[var(--color-primary)]' : 'text-[var(--color-border)]'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        <Link to={`/game/${game.id}`}>
          <h3 className="
            text-base font-bold font-[var(--font-heading)]
            text-[var(--color-text)] leading-tight
            group-hover:text-[var(--color-primary-dark)]
            transition-colors line-clamp-1
          ">
            {game.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2 font-[var(--font-body)]">
          {game.description}
        </p>

        {/* Bottom row: Favorite + Play */}
        <div className="flex items-center justify-between mt-3">
          <FavoriteHeart
            isFavorite={isFavorite}
            onToggle={() => onToggleFavorite(game.id)}
            size="sm"
          />

          <Link
            to={`/game/${game.id}`}
            className="
              px-3 py-1.5 rounded-lg text-sm font-semibold
              bg-[var(--color-primary)] text-[var(--color-text)]
              hover:bg-[var(--color-primary-dark)]
              transition-colors touch-target
              flex items-center gap-1
            "
          >
            Play <span>▶</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
