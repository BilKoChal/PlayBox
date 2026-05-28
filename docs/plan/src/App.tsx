import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SoundProvider } from '@/contexts/SoundContext';
import { GameProvider } from '@/contexts/GameContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import GamePage from '@/pages/GamePage';
import FavoritesPage from '@/pages/FavoritesPage';
import SettingsPage from '@/pages/SettingsPage';
import { useFavorites } from '@/hooks/useFavorites';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import Toast, { useToast } from '@/components/feedback/Toast';
import { getAllGameMetas, loadGame, getGameMeta } from '@/game-registry';
import { gameRegistry } from '@/game-registry.generated';

/**
 * Offline banner shown when the browser loses network connectivity.
 * Games that have been cached by the service worker remain playable.
 */
function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-semibold fixed top-0 left-0 right-0 z-50 shadow-md">
      You are offline — cached games are still playable!
    </div>
  );
}

/**
 * Inner app that uses hooks requiring context providers.
 * Must be rendered inside ThemeProvider, SoundProvider, GameProvider.
 */
function AppContent() {
  const { favorites, toggleFavorite, isFavorite, clearFavorites } = useFavorites();
  const { toasts, addToast, dismissToast } = useToast();

  // Get all game metadata (loaded from registry, no game code loaded)
  const games = getAllGameMetas(gameRegistry);

  const handleToggleFavorite = (gameId: string) => {
    const wasFavorite = isFavorite(gameId);
    toggleFavorite(gameId);
    const gameName = getGameMeta(gameRegistry, gameId)?.name || gameId;
    addToast(
      wasFavorite ? `Removed ${gameName} from favorites` : `Added ${gameName} to favorites!`,
      wasFavorite ? 'info' : 'success',
    );
  };

  // Search is now handled by useFilterState in HomePage (URL-driven)
  // The Header SearchBar updates URL params directly
  const handleSearch = (_query: string) => {
    // This is now a no-op since HomePage reads from URL params
    // The SearchBar in Header already updates URL params via useFilterState
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <OfflineBanner />
      <Header onSearch={handleSearch} games={games} />

      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                games={games}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                favorites={favorites}
              />
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <GamePage
                loadGame={(id) => loadGame(gameRegistry, id)}
                gameMeta={(id) => getGameMeta(gameRegistry, id)}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onToast={(message, type) => addToast(message, type)}
              />
            }
          />
          <Route
            path="/favorites"
            element={
              <FavoritesPage
                games={games}
                favorites={favorites}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onClearFavorites={clearFavorites}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <Footer />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

/**
 * Root App component with providers.
 */
export default function App() {
  return (
    <BrowserRouter basename="/PlayBox">
      <ThemeProvider>
        <SoundProvider>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
