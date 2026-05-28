/**
 * SettingsPage — Global settings with score management
 *
 * Features:
 * - Theme toggle (light/dark)
 * - Sound toggle (mute/unmute)
 * - Score export/import (JSON file download/upload)
 * - Clear all scores
 * - About section
 */

import { useState, useCallback, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundContext } from '@/contexts/SoundContext';
import Toggle from '@/components/ui/Toggle';
import Button from '@/components/ui/Button';
import { platform } from '@/lib/platform';
import { scoreTracker } from '@/lib/storage';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { isMuted, toggleMute } = useSoundContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  // Export scores as JSON file
  const handleExportScores = useCallback(async () => {
    setIsExporting(true);
    try {
      const json = await scoreTracker.exportScores();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `playbox-scores-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus('Scores exported successfully!');
    } catch (err) {
      showStatus('Failed to export scores', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [showStatus]);

  // Import scores from JSON file
  const handleImportScores = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const count = await scoreTracker.importScores(text);
      showStatus(`Imported ${count} score${count !== 1 ? 's' : ''}!`);
    } catch (err) {
      showStatus('Failed to import scores — invalid file', 'error');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [showStatus]);

  // Clear all scores
  const handleClearScores = useCallback(async () => {
    const confirmed = window.confirm('Are you sure you want to clear all scores? This cannot be undone.');
    if (!confirmed) return;

    setIsClearing(true);
    try {
      await scoreTracker.clearAllScores();
      showStatus('All scores cleared');
    } catch (err) {
      showStatus('Failed to clear scores', 'error');
    } finally {
      setIsClearing(false);
    }
  }, [showStatus]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-extrabold font-[var(--font-heading)] text-[var(--color-text)] mb-6">
        ⚙️ Settings
      </h1>

      {/* Status message */}
      {statusMessage && (
        <div className={`
          mb-4 px-4 py-2 rounded-lg text-sm font-semibold font-[var(--font-body)]
          ${statusMessage.type === 'success'
            ? 'bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)]'
            : 'bg-[var(--color-accent-red)]/15 text-[var(--color-accent-red)]'
          }
        `}>
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Appearance */}
        <section className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="text-base font-bold font-[var(--font-heading)] text-[var(--color-text)] mb-4">
            Appearance
          </h2>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)] font-[var(--font-body)]">
                Dark Mode
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] font-[var(--font-body)]">
                Switch between light and cozy dark theme
              </p>
            </div>
            <Toggle
              enabled={theme === 'dark'}
              onToggle={toggleTheme}
              label="Toggle dark mode"
            />
          </div>
        </section>

        {/* Sound */}
        <section className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="text-base font-bold font-[var(--font-heading)] text-[var(--color-text)] mb-4">
            Sound
          </h2>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)] font-[var(--font-body)]">
                Mute All Sounds
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] font-[var(--font-body)]">
                Turn off all game sounds and music
              </p>
            </div>
            <Toggle
              enabled={isMuted}
              onToggle={toggleMute}
              label="Toggle mute"
            />
          </div>
        </section>

        {/* Scores */}
        <section className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="text-base font-bold font-[var(--font-heading)] text-[var(--color-text)] mb-4">
            Scores
          </h2>

          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-secondary)] font-[var(--font-body)]">
              Export your scores to back them up or transfer to another device. Import to restore from a backup.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportScores}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : '📤 Export Scores'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : '📥 Import Scores'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportScores}
                className="hidden"
              />

              <Button
                variant="danger"
                size="sm"
                onClick={handleClearScores}
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : '🗑️ Clear All Scores'}
              </Button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="text-base font-bold font-[var(--font-heading)] text-[var(--color-text)] mb-4">
            About PlayBox
          </h2>

          <div className="space-y-2 text-sm font-[var(--font-body)]">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Version</span>
              <span className="text-[var(--color-text)] font-semibold">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Platform</span>
              <span className="text-[var(--color-text)] font-semibold capitalize">{platform.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">License</span>
              <span className="text-[var(--color-text)] font-semibold">MIT</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
