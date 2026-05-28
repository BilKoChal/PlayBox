/**
 * Platform Detection — Enhanced
 *
 * Detects whether PlayBox is running on:
 * - Web (browser)
 * - Tauri (Windows desktop)
 * - Capacitor (Android)
 *
 * Also provides:
 * - PWA standalone mode detection
 * - Service Worker support
 * - Online/offline status with event listeners
 * - Screen size category
 * - User preference detection (color scheme, reduced motion)
 * - Device capability detection (touch, keyboard, gamepad)
 */

export type PlatformType = 'web' | 'tauri' | 'capacitor';
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface PlatformInfo {
  /** Which platform we're running on */
  type: PlatformType;

  /** Whether we're running on a mobile device */
  isMobile: boolean;

  /** Whether we're running on a desktop app */
  isDesktop: boolean;

  /** Whether running as an installed PWA (standalone mode) */
  isStandalone: boolean;

  /** Whether the browser supports Service Workers */
  hasServiceWorker: boolean;

  /** Whether the device is currently online */
  isOnline: boolean;

  /** Current screen size category */
  screenSize: ScreenSize;

  /** Whether the platform supports fullscreen API */
  supportsFullscreen: boolean;

  /** Whether the platform supports the keyboard */
  hasKeyboard: boolean;

  /** Whether the platform supports touch */
  hasTouch: boolean;

  /** Whether the platform supports gamepad */
  hasGamepad: boolean;

  /** User's color scheme preference */
  prefersDarkMode: boolean;

  /** User's reduced motion preference */
  prefersReducedMotion: boolean;

  /** User's language */
  language: string;

  /** Viewport width in pixels */
  viewportWidth: number;

  /** Viewport height in pixels */
  viewportHeight: number;

  /** Device pixel ratio */
  devicePixelRatio: number;
}

// ============================================
// Detection Functions
// ============================================

function detectPlatformType(): PlatformType {
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  const isCapacitor = !!(window as any).Capacitor;
  return isTauri ? 'tauri' : isCapacitor ? 'capacitor' : 'web';
}

function detectIsStandalone(): boolean {
  // Check all PWA standalone indicators
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true || // iOS Safari
    document.referrer.includes('android-app://') // Android TWA
  );
}

function detectScreenSize(width: number): ScreenSize {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function detectPlatform(): PlatformInfo {
  const type = detectPlatformType();
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || type === 'capacitor';
  const isDesktop = !isMobile;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    type,
    isMobile,
    isDesktop,
    isStandalone: detectIsStandalone(),
    hasServiceWorker: 'serviceWorker' in navigator,
    isOnline: navigator.onLine,
    screenSize: detectScreenSize(viewportWidth),
    supportsFullscreen: !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled
    ),
    hasKeyboard: isDesktop,
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasGamepad: !!navigator.getGamepads,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    language: navigator.language || 'en',
    viewportWidth,
    viewportHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
}

// ============================================
// Platform Singleton
// ============================================

/** Current platform info (computed once at module load) */
export const platform: PlatformInfo = detectPlatform();

/** Re-detect platform (call after resize, orientation change, etc.) */
export function redetectPlatform(): PlatformInfo {
  return detectPlatform();
}

// ============================================
// Online/Offline Event System
// ============================================

type OnlineStatusListener = (isOnline: boolean) => void;

const onlineListeners = new Set<OnlineStatusListener>();

function handleOnline() {
  // Update the singleton's isOnline
  (platform as any).isOnline = true;
  for (const listener of onlineListeners) {
    try { listener(true); } catch {}
  }
}

function handleOffline() {
  (platform as any).isOnline = false;
  for (const listener of onlineListeners) {
    try { listener(false); } catch {}
  }
}

window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

/**
 * Register a callback for online/offline status changes.
 * Returns an unsubscribe function.
 */
export function onOnlineStatusChange(listener: OnlineStatusListener): () => void {
  onlineListeners.add(listener);
  return () => {
    onlineListeners.delete(listener);
  };
}

// ============================================
// Viewport Change Event System
// ============================================

type ViewportChangeListener = (info: PlatformInfo) => void;

const viewportListeners = new Set<ViewportChangeListener>();

let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

function handleResize() {
  // Debounce resize events
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const updated = detectPlatform();
    // Update singleton properties
    (platform as any).viewportWidth = updated.viewportWidth;
    (platform as any).viewportHeight = updated.viewportHeight;
    (platform as any).screenSize = updated.screenSize;

    for (const listener of viewportListeners) {
      try { listener(platform); } catch {}
    }
  }, 200);
}

window.addEventListener('resize', handleResize);

/**
 * Register a callback for viewport size changes (debounced).
 * Returns an unsubscribe function.
 */
export function onViewportChange(listener: ViewportChangeListener): () => void {
  viewportListeners.add(listener);
  return () => {
    viewportListeners.delete(listener);
  };
}

// ============================================
// Preference Change Detection
// ============================================

type PreferenceChangeListener = (prefersDarkMode: boolean, prefersReducedMotion: boolean) => void;

const preferenceListeners = new Set<PreferenceChangeListener>();

// Watch for color scheme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  (platform as any).prefersDarkMode = e.matches;
  for (const listener of preferenceListeners) {
    try { listener(e.matches, platform.prefersReducedMotion); } catch {}
  }
});

// Watch for reduced motion changes
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  (platform as any).prefersReducedMotion = e.matches;
  for (const listener of preferenceListeners) {
    try { listener(platform.prefersDarkMode, e.matches); } catch {}
  }
});

/**
 * Register a callback for user preference changes (color scheme, reduced motion).
 * Returns an unsubscribe function.
 */
export function onPreferenceChange(listener: PreferenceChangeListener): () => void {
  preferenceListeners.add(listener);
  return () => {
    preferenceListeners.delete(listener);
  };
}
