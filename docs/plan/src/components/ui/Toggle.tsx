interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

export default function Toggle({ enabled, onToggle, label, className = '' }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full
        transition-colors duration-[var(--transition-base)] focus-ring
        ${enabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}
        ${className}
      `}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={`
          inline-block h-5 w-5 rounded-full bg-white shadow-[var(--shadow-sm)]
          transition-transform duration-[var(--transition-base)]
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
