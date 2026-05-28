/**
 * LoadingSkeleton — Shimmer placeholder cards for game grid
 *
 * Mimics the GameCard layout with animated shimmer effect.
 * Used while games are loading or during navigation transitions.
 * Supports responsive grid layout identical to GameCard.
 */

interface LoadingSkeletonProps {
  /** Number of skeleton cards to render */
  count?: number;
  /** Size variant */
  size?: 'sm' | 'md';
  className?: string;
}

export default function LoadingSkeleton({
  count = 6,
  size = 'md',
  className = '',
}: LoadingSkeletonProps) {
  const isSmall = size === 'sm';

  return (
    <div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
      role="status"
      aria-label="Loading games"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`
            rounded-2xl overflow-hidden
            bg-[var(--color-bg-card)] border border-[var(--color-border)]
            ${isSmall ? 'shadow-[var(--shadow-sm)]' : 'shadow-[var(--shadow-md)]'}
          `}
        >
          {/* Thumbnail placeholder with shimmer */}
          <div
            className={`
              relative overflow-hidden
              ${isSmall ? 'aspect-[16/9]' : 'aspect-[16/10]'}
              bg-[var(--color-bg-hover)]
            `}
          >
            {/* Shimmer sweep effect */}
            <div
              className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/30 to-transparent
                animate-[shimmer_2s_ease-in-out_infinite]
              "
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>

          {/* Content placeholder */}
          <div className="p-3 space-y-2.5">
            {/* Category + difficulty row */}
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 rounded-full bg-[var(--color-bg-hover)]" />
              <div className="flex gap-0.5">
                <div className="h-3 w-3 rounded bg-[var(--color-bg-hover)]" />
                <div className="h-3 w-3 rounded bg-[var(--color-bg-hover)]" />
                <div className="h-3 w-3 rounded bg-[var(--color-bg-hover)]" />
              </div>
            </div>

            {/* Title */}
            <div
              className={`rounded-lg bg-[var(--color-bg-hover)] ${
                isSmall ? 'h-3.5 w-3/4' : 'h-4 w-2/3'
              }`}
            />

            {/* Description */}
            <div className="space-y-1.5">
              <div className="h-3 rounded bg-[var(--color-bg-hover)] w-full" />
              <div className="h-3 rounded bg-[var(--color-bg-hover)] w-4/5" />
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-1">
              <div className="h-6 w-8 rounded bg-[var(--color-bg-hover)]" />
              <div className="h-7 w-16 rounded-lg bg-[var(--color-bg-hover)]" />
            </div>
          </div>
        </div>
      ))}

      {/* Screen reader only loading text */}
      <span className="sr-only">Loading games...</span>
    </div>
  );
}

/**
 * Single skeleton card — can be used individually
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-bg-hover)]">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 rounded-lg bg-[var(--color-bg-hover)] w-3/4" />
        <div className="h-3 rounded bg-[var(--color-bg-hover)] w-1/2" />
      </div>
    </div>
  );
}
