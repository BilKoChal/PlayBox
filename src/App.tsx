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
import Toast, { useToast } from '@/components/feedback/Toast';
import { getAllGameMetas, loadGame, getGameMeta } from '@/game-registry';
import { gameRegistry } from '@/game-registry.generated';

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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Header onSearch={() => {}} />

      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                games={games}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
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
