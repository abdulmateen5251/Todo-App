// Hook for managing toast notifications
'use client';

import { useState, useCallback } from 'react';
import { ToastType } from '@/components/Toast';

interface ToastNotification {
  id: string;
  type: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastNotification = { id, type, message, action };
    
    setToasts((prev) => [...prev, toast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    return showToast('success', message, action);
  }, [showToast]);

  const error = useCallback((message: string) => {
    return showToast('error', message);
  }, [showToast]);

  const warning = useCallback((message: string) => {
    return showToast('warning', message);
  }, [showToast]);

  const info = useCallback((message: string) => {
    return showToast('info', message);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
