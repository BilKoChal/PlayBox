import type { GameCategory } from '@/types/game';
import { CATEGORIES } from '@/types/game';

interface BadgeProps {
  category: GameCategory;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ category, size = 'sm', className = '' }: BadgeProps) {
  const info = CATEGORIES[category];

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-semibold
        ${info.bgColor} ${info.color} ${sizeClasses}
        ${className}
      `}
    >
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  );
}
