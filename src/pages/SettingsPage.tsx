import { useTheme } from '@/contexts/ThemeContext';
import { useSoundContext } from '@/contexts/SoundContext';
import Toggle from '@/components/ui/Toggle';
import { platform } from '@/lib/platform';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { isMuted, toggleMute } = useSoundContext();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-extrabold font-[var(--font-heading)] text-[var(--color-text)] mb-6">
        ⚙️ Settings
      </h1>

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
