import { useState, useMemo } from 'react';
import type { GameMetadata, GameCategory } from '@/types/game';
import { CATEGORIES } from '@/types/game';
import GameCard from '@/components/game/GameCard';
import EmptyState from '@/components/feedback/EmptyState';
import { useSearch } from '@/hooks/useSearch';

interface HomePageProps {
  games: GameMetadata[];
  isFavorite: (gameId: string) => boolean;
  onToggleFavorite: (gameId: string) => void;
}

export default function HomePage({ games, isFavorite, onToggleFavorite }: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const { results, handleSearch: _handleSearch, clearSearch, isSearching } = useSearch(games);

  // Search is handled at the App level via Header's SearchBar
  void _handleSearch;

  // Filter by category
  const filteredGames = useMemo(() => {
    let filtered = results;
    if (selectedCategory) {
      filtered = filtered.filter((g) => g.category === selectedCategory);
    }
    return filtered;
  }, [results, selectedCategory]);

  const allCategories = Object.values(CATEGORIES);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Category filter pills */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
              font-[var(--font-body)] transition-colors touch-target
              ${!selectedCategory
                ? 'bg-[var(--color-primary)] text-[var(--color-text)]'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
              }
            `}
          >
            All Games
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
                font-[var(--font-body)] transition-colors touch-target
                flex items-center gap-1.5
                ${selectedCategory === cat.id
                  ? `${cat.bgColor} ${cat.color} border-2 border-current`
                  : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                }
              `}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      {(isSearching || selectedCategory) && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-secondary)] font-[var(--font-body)]">
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} found
            {isSearching && ' matching your search'}
            {selectedCategory && ` in ${CATEGORIES[selectedCategory].label}`}
          </p>
          <button
            onClick={() => {
              clearSearch();
              setSelectedCategory(null);
            }}
            className="text-sm font-semibold text-[var(--color-secondary)] hover:underline font-[var(--font-body)]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Game grid */}
      {filteredGames.length > 0 ? (
        <div className="
          grid gap-4
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        ">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={isFavorite(game.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No games found"
          description={
            isSearching
              ? 'Try a different search term or browse by category'
              : 'No games in this category yet'
          }
        />
      )}

      {/* Game count footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--color-text-muted)] font-[var(--font-body)]">
          {games.length} games available • More coming soon!
        </p>
      </div>
    </div>
  );
}
