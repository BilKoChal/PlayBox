/**
 * EmptyState — Friendly empty state with animations
 *
 * Phase 1.3 Polish:
 * - Pop-in animation on mount
 * - Floating animation on icon
 * - Better visual hierarchy
 * - Kid-friendly messaging
 */

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 animate-[popIn_400ms_ease-out] ${className}`}>
      {icon && (
        <div className="text-6xl mb-4 animate-[float_3s_ease-in-out_infinite]">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-[var(--color-text)] font-[var(--font-heading)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-xs font-[var(--font-body)] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
