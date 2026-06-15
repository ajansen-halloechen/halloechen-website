<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants';

defineOptions({ inheritAttrs: false });

const iconButton = tv({
  base: 'inline-flex items-center justify-center p-2 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
  variants: {
    variant: {
      plain: 'text-primary hover:bg-primary/70 hover:text-accent',
      nohover: 'text-current',
      outlined:
        'bg-transparent border border-primary text-primary hover:bg-primary/10',
      solid: 'bg-primary text-accent hover:bg-primary-900',
    },
  },
  defaultVariants: {
    variant: 'plain',
  },
});

type IconButtonVariants = VariantProps<typeof iconButton>;

const props = withDefaults(
  defineProps<{
    variant?: IconButtonVariants['variant'];
  }>(),
  {
    variant: 'plain',
  },
);

const attrs = useAttrs();

const buttonClass = computed(() =>
  iconButton({ variant: props.variant, class: attrs.class as string }),
);

const buttonAttrs = computed(() => {
  const { class: _, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <button type="button" v-bind="buttonAttrs" :class="buttonClass">
    <slot />
  </button>
</template>
