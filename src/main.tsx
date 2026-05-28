import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'PlayBox: Root element not found. Make sure there is a <div id="root"></div> in index.html.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Service Worker registration is handled automatically by vite-plugin-pwa
// with registerType: 'autoUpdate' in vite.config.ts.
// No manual registration needed — the plugin injects the registration script.
