import { useState, useCallback } from 'react';
import { fullscreenService } from '@/lib/fullscreen';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    await fullscreenService.enterFullscreen();
    setIsFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(async () => {
    await fullscreenService.exitFullscreen();
    setIsFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
