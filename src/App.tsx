import { BrowserRouter, Routes, Route } from 'react-router-dom';

/**
 * Root App component.
 * Currently a minimal shell — providers and pages will be added in Phase 0.2.
 */
export default function App() {
  return (
    <BrowserRouter basename="/PlayBox">
      <Routes>
        <Route
          path="/"
          element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              fontFamily: 'var(--font-body)',
            }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                color: 'var(--color-primary)',
                marginBottom: '0.5rem',
              }}>
                🎮 PlayBox
              </h1>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Game Station — Coming Soon!
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
