<script setup lang="ts">
import {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from 'reka-ui';
import { tv } from 'tailwind-variants';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import type { ToastItem } from '~/composables/use-toast';

const { toasts, dismiss } = useToast();

const toastRoot = tv({
  base: [
    'rounded-md border px-4 py-3 text-sm',
    'flex items-start gap-3 w-full',
    'data-[swipe=move]:transition-none',
    'data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)]',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200',
    'data-[swipe=end]:animate-[toast-swipe-out_100ms_ease-out]',
  ],
  variants: {
    variant: {
      success: 'border-success/40 bg-success text-primary',
      warning: 'border-warning/40 bg-warning text-primary',
      error: 'border-error/40 bg-error text-on-error',
    },
  },
  defaultVariants: {
    variant: 'success',
  },
});

function handleOpenChange(item: ToastItem, open: boolean) {
  if (!open) {
    dismiss(item.id);
  }
}
</script>

<template>
  <ToastProvider swipe-direction="right" label="Benachrichtigung">
    <ToastRoot
      v-for="item in toasts"
      :key="item.id"
      :open="item.open"
      :duration="item.duration"
      type="foreground"
      :class="toastRoot({ variant: item.variant })"
      @update:open="handleOpenChange(item, $event)"
    >
      <div class="flex-1 min-w-0">
        <ToastTitle v-if="item.title" class="font-semibold mb-0.5">
          {{ item.title }}
        </ToastTitle>
        <ToastDescription>
          {{ item.description }}
        </ToastDescription>
      </div>
      <ToastClose as-child>
        <UiIconButton
          variant="nohover"
          aria-label="Schließen"
          class="shrink-0 -mr-1 -mt-1"
        >
          <XMarkIcon class="size-5" />
        </UiIconButton>
      </ToastClose>
    </ToastRoot>

    <ToastViewport
      class="fixed right-0 bottom-10 z-[60] flex max-h-[calc(100dvh-14rem)] w-full max-w-sm flex-col gap-2 p-4 outline-none"
    />
  </ToastProvider>
</template>

<style scoped>
@keyframes toast-swipe-out {
  from {
    transform: translateX(var(--reka-toast-swipe-end-x));
  }

  to {
    transform: translateX(calc(var(--reka-toast-swipe-end-x) + 100%));
  }
}
</style>
