/**
 * GameOverlay — Loading and error states for game play
 *
 * Phase 1.3 Polish:
 * - Pulsing loading spinner with game-specific message
 * - Animated error state with bounce-in icon
 * - Smooth backdrop blur
 * - Better visual hierarchy
 */

interface GameOverlayProps {
  type: 'loading' | 'error';
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export default function GameOverlay({ type, message, onRetry, onBack }: GameOverlayProps) {
  return (
    <div className="
      absolute inset-0 z-10
      flex flex-col items-center justify-center
      bg-black/70 backdrop-blur-sm
      text-white font-[var(--font-body)]
      animate-[overlayFadeIn_300ms_ease-out]
    ">
      {type === 'loading' && (
        <>
          {/* Loading spinner — pulsing ring */}
          <div className="relative w-16 h-16 mb-5">
            <div className="
              absolute inset-0 border-4 border-white/20
              rounded-full
            " />
            <div className="
              absolute inset-0 border-4 border-transparent
              border-t-[var(--color-primary)] rounded-full
              animate-spin
            " />
            {/* Center dot pulse */}
            <div className="
              absolute inset-0 flex items-center justify-center
            ">
              <div className="
                w-3 h-3 rounded-full bg-[var(--color-primary)]
                animate-[pulseGlow_2s_ease-in-out_infinite]
              " />
            </div>
          </div>
          <p className="text-lg font-bold font-[var(--font-heading)]">
            {message || 'Loading game...'}
          </p>
          <p className="text-sm text-white/50 mt-1.5">Getting things ready!</p>

          {/* Loading progress dots */}
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                style={{
                  animation: `pulseGlow 1.4s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        </>
      )}

      {type === 'error' && (
        <>
          <span className="text-5xl mb-4 animate-[popIn_400ms_ease-out]">😵</span>
          <p className="text-lg font-bold font-[var(--font-heading)]">{message || 'Something went wrong'}</p>
          <p className="text-sm text-white/50 mt-1 mb-5">Don't worry, let's try again!</p>
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="
                  px-5 py-2.5 rounded-xl font-semibold
                  bg-[var(--color-primary)] text-[var(--color-text)]
                  hover:bg-[var(--color-primary-dark)] transition-all duration-200
                  active:scale-95 shadow-[0_2px_8px_rgba(255,184,48,0.3)]
                "
              >
                Try Again
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="
                  px-5 py-2.5 rounded-xl font-semibold
                  bg-white/10 text-white
                  hover:bg-white/20 transition-all duration-200
                  active:scale-95
                "
              >
                Go Back
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
