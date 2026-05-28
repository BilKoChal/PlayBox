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

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 3000);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-[var(--shadow-lg)]
        font-[var(--font-body)] text-sm font-semibold
        flex items-center gap-2 min-w-[200px] max-w-[360px]
        transition-all duration-200
        ${isLeaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
        ${typeStyles[toast.type || 'info']}
      `}
      role="alert"
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
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
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
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
