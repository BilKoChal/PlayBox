import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PlayBoxGame } from '@/types/game';
import { Difficulty, DIFFICULTIES } from '@/types/game';
import GameWrapper from '@/components/game/GameWrapper';
import GameOverlay from '@/components/game/GameOverlay';
import ScoreDisplay from '@/components/feedback/ScoreDisplay';
import Button from '@/components/ui/Button';
import { useGameContext } from '@/contexts/GameContext';

interface GamePageProps {
  loadGame: (gameId: string) => Promise<{ default: PlayBoxGame } | null>;
  gameMeta: (gameId: string) => import('@/types/game').GameMetadata | undefined;
  isFavorite: (gameId: string) => boolean;
  onToggleFavorite: (gameId: string) => void;
}

export default function GamePage({ loadGame, gameMeta, isFavorite, onToggleFavorite }: GamePageProps) {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { setActiveGame } = useGameContext();

  const [game, setGame] = useState<PlayBoxGame | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metadata = gameId ? gameMeta(gameId) : undefined;
  const fav = gameId ? isFavorite(gameId) : false;

  // Load game on mount
  useEffect(() => {
    if (!gameId) {
      setError('No game specified');
      setIsLoading(false);
      return;
    }

    const meta = gameMeta(gameId);
    if (!meta) {
      setError(`Game "${gameId}" not found`);
      setIsLoading(false);
      return;
    }

    if (meta.defaultDifficulty) {
      setDifficulty(meta.defaultDifficulty);
    }

    setActiveGame(meta);

    loadGame(gameId)
      .then((module) => {
        if (module?.default) {
          setGame(module.default);
          setIsLoading(false);
        } else {
          setError(`Failed to load game "${gameId}"`);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Game load error:', err);
        setError(`Error loading game: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      });
  }, [gameId, gameMeta, loadGame, setActiveGame]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
  }, []);

  const handleToast = useCallback((_message: string, _type?: 'info' | 'success' | 'warning' | 'error') => {
    // Toast integration will be wired in the full app
  }, []);

  const handleNavigateBack = useCallback(() => {
    setActiveGame(null);
    navigate('/');
  }, [navigate, setActiveGame]);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    if (gameId) {
      loadGame(gameId)
        .then((module) => {
          if (module?.default) {
            setGame(module.default);
            setIsLoading(false);
          } else {
            setError('Failed to load game');
            setIsLoading(false);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsLoading(false);
        });
    }
  }, [gameId, loadGame]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Game toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateBack}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Back</span>
          </Button>

          {/* Game title */}
          <h1 className="text-lg font-bold font-[var(--font-heading)] text-[var(--color-text)] truncate">
            {metadata?.name || gameId}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Score */}
          {game && <ScoreDisplay score={score} />}

          {/* Favorite toggle */}
          {gameId && (
            <button
              onClick={() => onToggleFavorite(gameId)}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all touch-target"
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span className="text-lg">{fav ? '❤️' : '🤍'}</span>
            </button>
        )}
        </div>
      </div>

      {/* Difficulty selector */}
      {metadata && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] font-[var(--font-body)]">
            Difficulty:
          </span>
          {metadata.difficulties.map((diff) => {
            const info = DIFFICULTIES[diff];
            return (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`
                  px-3 py-1 rounded-lg text-sm font-semibold font-[var(--font-body)]
                  transition-colors touch-target
                  ${difficulty === diff
                    ? 'bg-[var(--color-primary)] text-[var(--color-text)]'
                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                  }
                `}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Game area */}
      <div className="relative">
        {isLoading && (
          <GameOverlay type="loading" message={`Loading ${metadata?.name || 'game'}...`} />
        )}

        {error && (
          <GameOverlay
            type="error"
            message={error}
            onRetry={handleRetry}
            onBack={handleNavigateBack}
          />
        )}

        {game && !isLoading && !error && (
          <GameWrapper
            game={game}
            difficulty={difficulty}
            onScoreUpdate={handleScoreUpdate}
            onGameOver={handleGameOver}
            onToast={handleToast}
            onNavigateBack={handleNavigateBack}
          />
        )}
      </div>

      {/* Game info */}
      {metadata && (
        <div className="mt-4 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text)] font-[var(--font-heading)] mb-1">
            How to Play
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] font-[var(--font-body)]">
            {metadata.longDescription || metadata.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              {metadata.supportsKeyboard && '⌨️ Keyboard'}
              {metadata.supportsTouch && ' 👆 Touch'}
              {metadata.supportsGamepad && ' 🎮 Gamepad'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
