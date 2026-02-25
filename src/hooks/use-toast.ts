/**
 * Simple Toast Hook
 *
 * A lightweight toast notification system using React state.
 * In a production app, you might want to use a library like sonner, react-hot-toast, or shadcn/ui toast.
 */

import { useState, useCallback, useEffect } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

// Global state for toasts (simple implementation)
let toastListeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];
let toastIdCounter = 0;

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toasts]));
};

const addToast = (options: ToastOptions): string => {
  const id = `toast-${++toastIdCounter}`;
  const toast: Toast = {
    ...options,
    id,
    duration: options.duration ?? 5000,
  };

  toasts = [...toasts, toast];
  notifyListeners();

  // Auto-dismiss
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, toast.duration);
  }

  return id;
};

const dismissToast = (id: string) => {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
};

const dismissAllToasts = () => {
  toasts = [];
  notifyListeners();
};

/**
 * Hook for displaying toast notifications
 */
export function useToast() {
  const [, setLocalToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setLocalToasts(newToasts);
    };

    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = addToast(options);

    // Also log to console for debugging
    const icon = options.variant === 'destructive' ? '[ERROR]' :
                 options.variant === 'success' ? '[SUCCESS]' : '[INFO]';
    console.log(`${icon} ${options.title}${options.description ? ': ' + options.description : ''}`);

    return { id, dismiss: () => dismissToast(id) };
  }, []);

  return {
    toast,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
    toasts,
  };
}

/**
 * Hook to get all current toasts (for toast container component)
 */
export function useToastState() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };

    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  return {
    toasts: currentToasts,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
  };
}

export type { Toast, ToastOptions };
