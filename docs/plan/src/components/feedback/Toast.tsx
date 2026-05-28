/**
 * Toast — Notification system with slide-in animation
 *
 * Phase 1.3 Polish:
 * - Slide-in from right animation
 * - Smooth exit transition
 * - Better dark mode styling
 * - Icon prefix per type
 */

import { useEffect, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const typeStyles: Record<string, string> = {
  info: 'bg-[var(--color-secondary)] text-white',
  success: 'bg-[var(--color-accent-green)] text-white',
  warning: 'bg-[var(--color-primary)] text-[var(--color-text)]',
  error: 'bg-[var(--color-accent-red)] text-white',
};

const typeIcons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  // Trigger enter animation
  useEffect(() => {
    requestAnimationFrame(() => setIsEntering(false));
  }, []);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 250);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 3500);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-[var(--shadow-lg)]
        font-[var(--font-body)] text-sm font-semibold
        flex items-center gap-2.5 min-w-[220px] max-w-[380px]
        transition-all duration-250 ease-out
        ${isEntering ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}
        ${isLeaving ? 'opacity-0 translate-x-8 scale-95' : ''}
        ${typeStyles[toast.type || 'info']}
      `}
      role="alert"
    >
      <span className="text-base flex-shrink-0">{typeIcons[toast.type || 'info']}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/** Hook for managing toast notifications */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
