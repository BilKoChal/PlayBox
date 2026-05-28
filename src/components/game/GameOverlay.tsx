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
    ">
      {type === 'loading' && (
        <>
          {/* Loading spinner */}
          <div className="relative w-16 h-16 mb-4">
            <div className="
              absolute inset-0 border-4 border-white/20
              rounded-full
            " />
            <div className="
              absolute inset-0 border-4 border-transparent
              border-t-[var(--color-primary)] rounded-full
              animate-spin
            " />
          </div>
          <p className="text-lg font-semibold">{message || 'Loading game...'}</p>
          <p className="text-sm text-white/60 mt-1">Getting things ready!</p>
        </>
      )}

      {type === 'error' && (
        <>
          <span className="text-5xl mb-4">😵</span>
          <p className="text-lg font-semibold">{message || 'Something went wrong'}</p>
          <p className="text-sm text-white/60 mt-1 mb-4">Don't worry, let's try again!</p>
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="
                  px-4 py-2 rounded-xl font-semibold
                  bg-[var(--color-primary)] text-[var(--color-text)]
                  hover:bg-[var(--color-primary-dark)] transition-colors
                "
              >
                Try Again
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="
                  px-4 py-2 rounded-xl font-semibold
                  bg-white/10 text-white
                  hover:bg-white/20 transition-colors
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
