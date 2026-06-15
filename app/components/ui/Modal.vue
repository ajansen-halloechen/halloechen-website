<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from 'reka-ui';
import { XMarkIcon } from '@heroicons/vue/24/outline';

defineProps<{
  title: string;
}>();

const open = defineModel<boolean>('open', { default: false });
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-primary bg-surface p-6 shadow-lg"
      >
        <div class="flex items-center justify-between mb-4">
          <DialogTitle class="text-lg font-semibold">
            {{ title }}
          </DialogTitle>
          <DialogClose as-child>
            <UiIconButton aria-label="Schließen">
              <XMarkIcon class="size-5" />
            </UiIconButton>
          </DialogClose>
        </div>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
