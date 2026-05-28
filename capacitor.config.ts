import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playbox.gamestation',
  appName: 'PlayBox',
  webDir: 'dist',
  server: {
    // Use https scheme for secure context (required for IndexedDB, Service Worker, etc.)
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FFB830',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FFB830',
    },
  },
};

export default config;
