import { createContext, useContext, useState, type ReactNode } from 'react';
import type { GameMetadata } from '@/types/game';

interface GameContextType {
  /** Currently active game (null when on catalog) */
  activeGame: GameMetadata | null;
  /** Set the active game */
  setActiveGame: (game: GameMetadata | null) => void;
  /** Whether a game is currently being played */
  isPlaying: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);

  const isPlaying = activeGame !== null;

  return (
    <GameContext.Provider value={{ activeGame, setActiveGame, isPlaying }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
