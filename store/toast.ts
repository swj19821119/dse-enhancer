import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message, duration = 3000) => {
    const id = generateId();
    const toast: Toast = { id, type, message, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

export const toast = {
  success: (message: string, duration?: number) => 
    useToastStore.getState().addToast('success', message, duration),
  error: (message: string, duration?: number) => 
    useToastStore.getState().addToast('error', message, duration),
  info: (message: string, duration?: number) => 
    useToastStore.getState().addToast('info', message, duration),
  warning: (message: string, duration?: number) => 
    useToastStore.getState().addToast('warning', message, duration),
};