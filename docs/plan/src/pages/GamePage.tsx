/**
 * GamePage — Individual game play page
 *
 * Features:
 * - Game toolbar with back, title, score, favorite heart
 * - Difficulty selector
 * - GameWrapper for game lifecycle
 * - GameOverModal for score submission
 * - Leaderboard display
 * - Game info section
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PlayBoxGame } from '@/types/game';
import { Difficulty, DIFFICULTIES } from '@/types/game';
import GameWrapper from '@/components/game/GameWrapper';
import GameOverlay from '@/components/game/GameOverlay';
import GameOverModal from '@/components/game/GameOverModal';
import FavoriteHeart from '@/components/game/FavoriteHeart';
import ScoreDisplay from '@/components/feedback/ScoreDisplay';
import Button from '@/components/ui/Button';
import Leaderboard from '@/components/game/Leaderboard';
import DifficultySelector from '@/components/ui/DifficultySelector';
import { useGameContext } from '@/contexts/GameContext';
import { useHighScore } from '@/hooks/useHighScore';
import type { ScoreType } from '@/lib/storage';

interface GamePageProps {
  loadGame: (gameId: string) => Promise<{ default: PlayBoxGame } | null>;
  gameMeta: (gameId: string) => import('@/types/game').GameMetadata | undefined;
  isFavorite: (gameId: string) => boolean;
  onToggleFavorite: (gameId: string) => void;
  onToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

/** Map engine types to score types */
function getScoreTypeForGame(gameId: string): ScoreType {
  switch (gameId) {
    case 'sudoku':
      return 'time';
    case 'snake':
      return 'length';
    default:
      return 'points';
  }
}

export default function GamePage({ loadGame, gameMeta, isFavorite, onToggleFavorite, onToast }: GamePageProps) {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { setActiveGame } = useGameContext();

  const [game, setGame] = useState<PlayBoxGame | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [gameKey, setGameKey] = useState(0); // Used to remount GameWrapper

  const metadata = gameId ? gameMeta(gameId) : undefined;
  const fav = gameId ? isFavorite(gameId) : false;
  const scoreType = gameId ? getScoreTypeForGame(gameId) : 'points';

  // High score hook
  const { topScores, refresh: refreshScores } = useHighScore(
    gameId || '',
    difficulty,
    scoreType,
  );

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

  const handleGameOver = useCallback((gameFinalScore: number) => {
    setFinalScore(gameFinalScore);
    setShowGameOver(true);
  }, []);

  const handleToast = useCallback((message: string, type?: 'info' | 'success' | 'warning' | 'error') => {
    onToast?.(message, type);
  }, [onToast]);

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

  const handlePlayAgain = useCallback(() => {
    setShowGameOver(false);
    setScore(0);
    setGameKey((prev) => prev + 1); // Remount GameWrapper
  }, []);

  const handleDifficultyChange = useCallback((newDiff: Difficulty | null) => {
    if (newDiff) {
      setDifficulty(newDiff);
      setGameKey((prev) => prev + 1); // Remount game with new difficulty
    }
  }, []);

  const handleGameOverClose = useCallback(() => {
    setShowGameOver(false);
    refreshScores();
  }, [refreshScores]);

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
            <FavoriteHeart
              isFavorite={fav}
              onToggle={() => onToggleFavorite(gameId)}
              size="md"
            />
          )}
        </div>
      </div>

      {/* Difficulty selector */}
      {metadata && (
        <div className="mb-4">
          <DifficultySelector
            selected={difficulty}
            onSelect={handleDifficultyChange}
            available={metadata.difficulties}
            showAll={false}
            size="sm"
          />
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
            key={gameKey}
            game={game}
            difficulty={difficulty}
            onScoreUpdate={handleScoreUpdate}
            onGameOver={handleGameOver}
            onToast={handleToast}
            onNavigateBack={handleNavigateBack}
          />
        )}
      </div>

      {/* Leaderboard section */}
      {gameId && topScores.length > 0 && !isLoading && !error && (
        <div className="mt-6 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
          <h2 className="text-base font-bold font-[var(--font-heading)] text-[var(--color-text)] mb-3 flex items-center gap-2">
            <span>🏆</span>
            Top Scores — {DIFFICULTIES[difficulty].emoji} {DIFFICULTIES[difficulty].label}
          </h2>
          <Leaderboard scores={topScores} scoreType={scoreType} maxDisplay={5} />
        </div>
      )}

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

      {/* Game Over Modal */}
      {metadata && (
        <GameOverModal
          isOpen={showGameOver}
          onClose={handleGameOverClose}
          game={metadata}
          difficulty={difficulty}
          finalScore={finalScore}
          scoreType={scoreType}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
