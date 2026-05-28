/**
 * Fullscreen Service
 *
 * Cross-platform fullscreen support:
 * - Web: Fullscreen API
 * - Tauri: Tauri window API
 * - Capacitor: Android immersive mode
 *
 * Will be fully implemented in Phase 0.3 (Shared Services).
 */

import { platform } from './platform';

export class FullscreenService {
  private isFullscreenState = false;

  /** Check if currently in fullscreen */
  isFullscreen(): boolean {
    return this.isFullscreenState;
  }

  /** Enter fullscreen mode */
  async enterFullscreen(): Promise<void> {
    if (platform.type === 'tauri') {
      // Tauri: use window API
      try {
        // Dynamic import — only available in Tauri environment
        const tauriWindow = await import('@tauri-apps/api/window');
        await tauriWindow.getCurrentWindow().setFullscreen(true);
        this.isFullscreenState = true;
      } catch {
        // Fallback to web API
        await this.webEnterFullscreen();
      }
    } else if (platform.type === 'capacitor') {
      // Capacitor: use Android immersive mode (via plugin)
      // Will be implemented when Capacitor plugins are added
      await this.webEnterFullscreen();
    } else {
      await this.webEnterFullscreen();
    }
  }

  /** Exit fullscreen mode */
  async exitFullscreen(): Promise<void> {
    if (platform.type === 'tauri') {
      try {
        // Dynamic import — only available in Tauri environment
        const tauriWindow = await import('@tauri-apps/api/window');
        await tauriWindow.getCurrentWindow().setFullscreen(false);
        this.isFullscreenState = false;
      } catch {
        await this.webExitFullscreen();
      }
    } else {
      await this.webExitFullscreen();
    }
  }

  /** Toggle fullscreen */
  async toggleFullscreen(): Promise<void> {
    if (this.isFullscreenState) {
      await this.exitFullscreen();
    } else {
      await this.enterFullscreen();
    }
  }

  private async webEnterFullscreen(): Promise<void> {
    const elem = document.documentElement as any;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      await elem.webkitRequestFullscreen();
    }
    this.isFullscreenState = true;
  }

  private async webExitFullscreen(): Promise<void> {
    const doc = document as any;
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
    this.isFullscreenState = false;
  }
}

/** Singleton instance */
export const fullscreenService = new FullscreenService();
