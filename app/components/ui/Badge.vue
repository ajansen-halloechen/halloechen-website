<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

const badge = tv({
  base: 'inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium whitespace-nowrap',
  variants: {
    color: {
      primary: 'bg-primary/15 text-primary',
      accent: 'bg-accent/25 text-accent-800',
      warning: 'bg-warning/60 text-warning-900',
      neutral: 'bg-neutral-200 text-neutral-700',
    },
  },
  defaultVariants: {
    color: 'neutral',
  },
});

type BadgeVariants = VariantProps<typeof badge>;

const props = withDefaults(
  defineProps<{
    color?: BadgeVariants['color'];
    class?: string;
  }>(),
  {
    color: 'neutral',
    class: undefined,
  },
);
</script>

<template>
  <span :class="twMerge(badge({ color: props.color }), props.class)">
    <slot />
  </span>
</template>
