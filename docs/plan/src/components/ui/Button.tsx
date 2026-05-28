/**
 * Button — Reusable button with variants and sizes
 *
 * Phase 1.3 Polish:
 * - Smooth active:scale animation
 * - Better shadow transitions
 * - Dark mode glow effects on primary
 * - Focus ring improvement
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-text)] hover:bg-[var(--color-primary-dark)] hover:shadow-[0_4px_12px_rgba(255,184,48,0.3)] active:scale-95 shadow-[var(--shadow-sm)] dark:hover:shadow-[0_4px_16px_rgba(255,207,112,0.2)]',
  secondary:
    'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] hover:shadow-[0_4px_12px_rgba(77,168,218,0.3)] active:scale-95 shadow-[var(--shadow-sm)]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] active:scale-95',
  danger:
    'bg-[var(--color-accent-red)] text-white hover:opacity-90 hover:shadow-[0_4px_12px_rgba(239,71,111,0.3)] active:scale-95 shadow-[var(--shadow-sm)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg min-h-[36px]',
  md: 'px-4 py-2 text-base rounded-xl min-h-[44px]',
  lg: 'px-6 py-3 text-lg rounded-xl min-h-[52px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold font-[var(--font-body)]
        transition-all duration-200
        focus-ring touch-target
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
