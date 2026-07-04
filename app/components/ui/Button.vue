<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants';

const button = tv({
  base: 'rounded-md px-4 py-2 font-semibold transition-colors cursor-pointer disabled:opacity-50',
  variants: {
    variant: {
      solid: '',
      outlined: 'bg-transparent border-2',
    },
    color: {
      primary: '',
      error: '',
      accent: '',
    },
  },
  compoundVariants: [
    {
      variant: 'solid',
      color: 'primary',
      class: 'bg-primary text-on-primary hover:bg-primary-900',
    },
    {
      variant: 'solid',
      color: 'error',
      class: 'bg-error text-on-error hover:bg-error-800',
    },
    {
      variant: 'solid',
      color: 'accent',
      class: 'bg-accent text-accent-950 hover:bg-accent-300',
    },
    {
      variant: 'outlined',
      color: 'primary',
      class: 'border-primary text-primary hover:bg-primary-50',
    },
    {
      variant: 'outlined',
      color: 'error',
      class: 'border-error text-error hover:bg-error-50',
    },
    {
      variant: 'outlined',
      color: 'accent',
      class: 'border-accent text-accent-700 hover:bg-accent-50',
    },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
  },
});

type ButtonVariants = VariantProps<typeof button>;

withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant'];
    color?: ButtonVariants['color'];
  }>(),
  {
    variant: 'solid',
    color: 'primary',
  },
);
</script>

<template>
  <button :class="button({ variant, color })">
    <slot />
  </button>
</template>
