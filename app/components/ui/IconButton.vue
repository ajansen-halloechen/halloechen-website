<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants';

const iconButton = tv({
  base: 'inline-flex items-center justify-center p-2 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
  variants: {
    variant: {
      plain: 'text-primary hover:bg-primary/70 hover:text-accent',
      outlined: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
      solid: 'bg-primary text-accent hover:bg-primary-900',
    },
  },
  defaultVariants: {
    variant: 'plain',
  },
});

type IconButtonVariants = VariantProps<typeof iconButton>;

withDefaults(
  defineProps<{
    variant?: IconButtonVariants['variant'];
  }>(),
  {
    variant: 'plain',
  },
);
</script>

<template>
  <button type="button" :class="iconButton({ variant })">
    <slot />
  </button>
</template>
