/**
 * Fullscreen Service
 *
 * Cross-platform fullscreen support:
 * - Web: Fullscreen API
 * - Tauri: Tauri window API (accessed via runtime __TAURI_INTERNALS__)
 * - Capacitor: Android immersive mode (future)
 *
 * IMPORTANT: We do NOT import @tauri-apps/api directly.
 * Instead, we access Tauri APIs through the global __TAURI_INTERNALS__ object
 * at runtime. This prevents Rollup from trying to resolve the Tauri package
 * during the web build (where it's not installed).
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
      try {
        await this.tauriSetFullscreen(true);
        this.isFullscreenState = true;
        return;
      } catch {
        // Fallback to web API
      }
    }
    await this.webEnterFullscreen();
  }

  /** Exit fullscreen mode */
  async exitFullscreen(): Promise<void> {
    if (platform.type === 'tauri') {
      try {
        await this.tauriSetFullscreen(false);
        this.isFullscreenState = false;
        return;
      } catch {
        // Fallback to web API
      }
    }
    await this.webExitFullscreen();
  }

  /** Toggle fullscreen */
  async toggleFullscreen(): Promise<void> {
    if (this.isFullscreenState) {
      await this.exitFullscreen();
    } else {
      await this.enterFullscreen();
    }
  }

  /**
   * Access Tauri fullscreen API via the global runtime.
   * This avoids any static import of @tauri-apps/api.
   */
  private async tauriSetFullscreen(flag: boolean): Promise<void> {
    const internals = (window as any).__TAURI_INTERNALS__;
    if (!internals) {
      throw new Error('Tauri internals not available');
    }

    // Use Tauri's invoke protocol through the internal API
    // The window plugin is available at __TAURI_INTERNALS__.invoke
    // or we can use the proper Tauri window API if available
    if (internals.window) {
      const win = internals.window.getCurrent();
      if (win?.setFullscreen) {
        await win.setFullscreen(flag);
        return;
      }
    }

    // Alternative: use the Tauri invoke command
    if (internals.invoke) {
      await internals.invoke('plugin:window|set_fullscreen', { label: null, flag });
      return;
    }

    throw new Error('Could not access Tauri window API');
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
