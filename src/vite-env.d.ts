/// <reference types="vite/client" />

// Type declarations for Vite-specific features

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.mp3' {
  const content: string;
  export default content;
}

declare module '*.ogg' {
  const content: string;
  export default content;
}

declare module '*.wav' {
  const content: string;
  export default content;
}

// Tauri API — only available at runtime in Tauri desktop app
// Declared here so TypeScript doesn't error on dynamic imports
declare module '@tauri-apps/api/window' {
  export function getCurrentWindow(): {
    setFullscreen(flag: boolean): Promise<void>;
    setTitle(title: string): Promise<void>;
    close(): Promise<void>;
  };
}

// PWA register type
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
