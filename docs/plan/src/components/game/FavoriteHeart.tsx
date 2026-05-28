/**
 * FavoriteHeart — Heart button with particle animation on toggle
 *
 * Shows a heart icon that bounces and emits particles when toggled.
 * Used on GameCard and in the GamePage toolbar.
 */

import { useCallback, useRef, useEffect, useState } from 'react';

interface FavoriteHeartProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  color: string;
  size: number;
}

const HEART_COLORS = [
  '#FF6B6B', '#FF4757', '#FF6348', '#EE5A24', '#FF3838',
  '#FC427B', '#E84393', '#FD79A8',
];

export default function FavoriteHeart({
  isFavorite,
  onToggle,
  size = 'md',
  className = '',
}: FavoriteHeartProps) {
  const [isBouncing, setIsBouncing] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onToggle();

      // Bounce animation
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 400);

      // Emit particles if adding to favorites
      if (!isFavorite) {
        emitParticles();
      }
    },
    [onToggle, isFavorite],
  );

  const emitParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: particleIdRef.current++,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        opacity: 1,
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        size: 3 + Math.random() * 4,
      });
    }
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const frame = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity
            opacity: p.opacity - 0.03,
          }))
          .filter((p) => p.opacity > 0),
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [particles]);

  return (
    <button
      ref={containerRef}
      onClick={handleClick}
      className={`
        relative flex items-center justify-center rounded-lg
        transition-all duration-200 touch-target
        ${isFavorite
          ? 'text-[var(--color-accent-red)]'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]'
        }
        ${isBouncing ? 'animate-[heartBounce_400ms_ease]' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {/* Heart icon */}
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full p-1.5 transition-transform duration-200"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>

      {/* Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
          }}
        />
      ))}
    </button>
  );
}
