import type { GameMetadata } from '@/types/game';
import GameCard from '@/components/game/GameCard';
import EmptyState from '@/components/feedback/EmptyState';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';

interface FavoritesPageProps {
  games: GameMetadata[];
  favorites: string[];
  isFavorite: (gameId: string) => boolean;
  onToggleFavorite: (gameId: string) => void;
  onClearFavorites: () => void;
}

export default function FavoritesPage({
  games,
  favorites,
  isFavorite,
  onToggleFavorite,
  onClearFavorites,
}: FavoritesPageProps) {
  const favoriteGames = games.filter((g) => favorites.includes(g.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold font-[var(--font-heading)] text-[var(--color-text)]">
          ❤️ My Favorites
        </h1>
        {favoriteGames.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFavorites}>
            Clear All
          </Button>
        )}
      </div>

      {favoriteGames.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteGames.map((game) => (
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
          icon="💝"
          title="No favorites yet"
          description="Tap the heart on any game card to add it to your favorites!"
          action={
            <Link to="/">
              <Button variant="primary" size="md">
                Browse Games
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
