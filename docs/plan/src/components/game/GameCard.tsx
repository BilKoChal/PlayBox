/**
 * GameCard — Game card with thumbnail, metadata, and favorite heart
 *
 * Phase 1.3 Polish:
 * - Hover lift with shadow transition
 * - Play button overlay on thumbnail hover
 * - Thumbnail zoom effect on hover
 * - Smooth fade-in on mount with stagger
 * - Category color dot indicator
 * - Engine badge overlay
 * - FavoriteHeart button with particle animation
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
  /** Stagger delay index for mount animation (0-based) */
  staggerIndex?: number;
}

export default function GameCard({
  game,
  isFavorite,
  onToggleFavorite,
  className = '',
  staggerIndex = 0,
}: GameCardProps) {
  const difficultyInfo = DIFFICULTIES[game.defaultDifficulty];
  const categoryInfo = CATEGORIES[game.category];

  return (
    <div
      className={`
        group relative
        bg-[var(--color-bg-card)] rounded-2xl
        border border-[var(--color-border)]
        shadow-[var(--shadow-sm)]
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        overflow-hidden
        animate-[cardFadeIn_400ms_ease-out_both]
        ${className}
      `}
      style={{
        animationDelay: `${Math.min(staggerIndex * 50, 500)}ms`,
      }}
    >
      {/* Thumbnail */}
      <Link to={`/game/${game.id}`} className="block relative">
        <div
          className="
            relative aspect-[16/10] bg-gradient-to-br from-[var(--color-bg-hover)]
            to-[var(--color-bg)] overflow-hidden
          "
        >
          {/* Placeholder thumbnail with category emoji/icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-50 group-hover:scale-125 group-hover:opacity-70 transition-all duration-500 ease-out">
              {categoryInfo.emoji}
            </span>
          </div>

          {/* Engine badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className="
              px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase
              bg-black/40 text-white backdrop-blur-sm
              transition-opacity duration-200
              group-hover:opacity-0
            ">
              {game.engine}
            </span>
          </div>

          {/* Play Button Overlay — appears on hover */}
          <div className="
            absolute inset-0 flex items-center justify-center
            bg-black/0 group-hover:bg-black/20
            transition-colors duration-300
          ">
            <div className="
              w-14 h-14 flex items-center justify-center
              bg-[var(--color-primary)] rounded-full
              opacity-0 group-hover:opacity-100
              scale-75 group-hover:scale-100
              transition-all duration-300 ease-out
              shadow-[0_4px_14px_rgba(255,184,48,0.4)]
            ">
              <svg
                className="w-7 h-7 text-[var(--color-text)] ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite heart — positioned over thumbnail */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteHeart
          isFavorite={isFavorite}
          onToggle={() => onToggleFavorite(game.id)}
          size="sm"
          className="bg-white/80 dark:bg-[var(--color-bg-card)]/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-[var(--color-bg-card)] hover:scale-110 transition-all duration-200 !w-9 !h-9"
        />
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Category + Difficulty row */}
        <div className="flex items-center justify-between mb-1.5">
          <Badge category={game.category} size="sm" />
          <div className="flex items-center gap-0.5" title={difficultyInfo.label}>
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className={`text-xs transition-colors duration-200 ${
                  i < difficultyInfo.stars
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-border)]'
                }`}
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
            transition-colors duration-200 line-clamp-1
          ">
            {game.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2 font-[var(--font-body)]">
          {game.description}
        </p>

        {/* Bottom row: Play button */}
        <div className="flex items-center justify-end mt-3">
          <Link
            to={`/game/${game.id}`}
            className="
              px-3.5 py-1.5 rounded-lg text-sm font-semibold
              bg-[var(--color-primary)] text-[var(--color-text)]
              hover:bg-[var(--color-primary-dark)] hover:shadow-[0_2px_8px_rgba(255,184,48,0.3)]
              active:scale-95
              transition-all duration-200 touch-target
              flex items-center gap-1.5
            "
          >
            Play
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
