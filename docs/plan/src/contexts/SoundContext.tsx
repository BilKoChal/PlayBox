import { createContext, useContext, useState, type ReactNode } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  mute: () => void;
  unmute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEY = 'playbox-sound-muted';

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const mute = () => {
    setIsMuted(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  };

  const unmute = () => {
    setIsMuted(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'false');
    } catch {}
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, mute, unmute }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext(): SoundContextType {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
}
