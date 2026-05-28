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

// Register PWA service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/PlayBox/sw.js')
      .then((registration) => {
        console.log('PlayBox SW registered:', registration.scope);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'activated' &&
                navigator.serviceWorker.controller
              ) {
                // New content is available — could show a toast here
                console.log('PlayBox: New version available, refresh to update');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('PlayBox SW registration failed:', error);
      });
  });
}
