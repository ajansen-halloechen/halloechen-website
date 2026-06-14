import { readonly, ref } from 'vue';

export type ToastVariant = 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title?: string;
  description: string;
  variant: ToastVariant;
  duration?: number;
  open: boolean;
}

export interface ToastOptions {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 5000;

const toasts = ref<ToastItem[]>([]);
let idCounter = 0;

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `toast-${idCounter}`;
}

function addToast(options: ToastOptions): string {
  const id = generateId();
  const item: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? 'success',
    duration: options.duration ?? DEFAULT_DURATION,
    open: true,
  };

  if (toasts.value.length >= MAX_TOASTS) {
    toasts.value = toasts.value.slice(1);
  }

  toasts.value.push(item);
  return id;
}

function dismiss(id: string) {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index === -1) return;

  toasts.value[index]!.open = false;

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 150);
}

export function useToast() {
  function toast(options: ToastOptions | string) {
    if (typeof options === 'string') {
      return addToast({ description: options });
    }
    return addToast(options);
  }

  function success(description: string, title?: string) {
    return addToast({ description, title, variant: 'success' });
  }

  function warning(description: string, title?: string) {
    return addToast({ description, title, variant: 'warning' });
  }

  function error(description: string, title?: string) {
    return addToast({ description, title, variant: 'error' });
  }

  return {
    toasts: readonly(toasts),
    toast,
    success,
    warning,
    error,
    dismiss,
  };
}
