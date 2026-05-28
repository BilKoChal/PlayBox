import { useEffect, useRef, useCallback } from 'react';
import type { PlayBoxGame, MountOptions, Difficulty, GameCallbacks } from '@/types/game';
import { soundManager } from '@/lib/audio';
import { scoreTracker } from '@/lib/storage';
import { platform } from '@/lib/platform';
import { fullscreenService } from '@/lib/fullscreen';

interface GameWrapperProps {
  game: PlayBoxGame;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onNavigateBack: () => void;
  className?: string;
}

/**
 * GameWrapper — the bridge between React and PlayBoxGame.
 *
 * Manages the full lifecycle:
 * 1. Creates a container div
 * 2. Calls game.mount() with proper options
 * 3. Handles pause/resume on visibility change
 * 4. Calls game.unmount() on cleanup
 * 5. Forcibly clears container as safety net
 */
export default function GameWrapper({
  game,
  difficulty,
  onScoreUpdate,
  onGameOver,
  onToast,
  onNavigateBack,
  className = '',
}: GameWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const pausedRef = useRef(false);

  const mountGame = useCallback(() => {
    if (!containerRef.current || mountedRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const callbacks: GameCallbacks = {
      onScoreUpdate,
      onGameOver,
      onPause: () => {
        pausedRef.current = true;
      },
      onResume: () => {
        pausedRef.current = false;
      },
      onToast,
      onNavigateBack,
    };

    const options: MountOptions = {
      container,
      difficulty,
      callbacks,
      utilities: {
        soundManager,
        scoreTracker,
        platform,
        fullscreen: fullscreenService,
        difficulty,
        difficultyParams: {}, // Game-specific params injected by game itself
      },
      width: rect.width,
      height: rect.height,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };

    game.mount(options);
    mountedRef.current = true;
  }, [game, difficulty, onScoreUpdate, onGameOver, onToast, onNavigateBack]);

  const unmountGame = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      game.unmount();
    } catch (err) {
      console.warn('Game unmount error:', err);
    }

    // Safety net: forcibly clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    mountedRef.current = false;
  }, [game]);

  // Mount on mount, unmount on unmount
  useEffect(() => {
    mountGame();
    return () => {
      unmountGame();
    };
  }, [mountGame, unmountGame]);

  // Re-mount when difficulty changes
  useEffect(() => {
    if (mountedRef.current) {
      unmountGame();
      mountGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  // Pause/resume on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        game.pause?.();
        pausedRef.current = true;
      } else {
        game.resume?.();
        pausedRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [game]);

  return (
    <div
      ref={containerRef}
      className={`
        game-container w-full rounded-xl overflow-hidden bg-black
        ${className}
      `}
      role="application"
      aria-label={`Play ${game.metadata.name}`}
    />
  );
}
