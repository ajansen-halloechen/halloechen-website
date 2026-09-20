<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { twMerge } from 'tailwind-merge';

const props = defineProps<{
  title: string;
  description?: string;
  size?: 'lg' | 'xl';
}>();

const open = defineModel<boolean>('open', { default: false });

const sizeClass = computed(() =>
  props.size === 'xl' ? 'max-w-3xl' : 'max-w-lg',
);
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        :class="
          twMerge(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-primary bg-surface p-6 shadow-lg',
            sizeClass,
          )
        "
      >
        <div class="mb-4 flex shrink-0 items-center justify-between">
          <DialogTitle class="text-lg font-semibold">
            {{ title }}
          </DialogTitle>
          <DialogClose as-child>
            <UiIconButton aria-label="Schließen">
              <XMarkIcon class="size-5" />
            </UiIconButton>
          </DialogClose>
        </div>
        <DialogDescription
          :class="
            description ? 'mb-4 shrink-0 text-sm text-gray-600' : 'sr-only'
          "
        >
          {{ description ?? title }}
        </DialogDescription>
        <div class="min-h-0 flex-1 overflow-y-auto px-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="mt-4 shrink-0">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
