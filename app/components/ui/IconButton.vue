<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants';

defineOptions({ inheritAttrs: false });

const iconButton = tv({
  base: 'inline-flex items-center justify-center p-2 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
  variants: {
    variant: {
      plain: '',
      nohover: 'text-current',
      outlined: 'bg-transparent border',
      solid: '',
    },
    color: {
      primary: '',
      warning: '',
      error: '',
    },
  },
  compoundVariants: [
    {
      variant: 'plain',
      color: 'primary',
      class: 'text-primary hover:bg-primary/70 hover:text-accent',
    },
    {
      variant: 'plain',
      color: 'warning',
      class: 'text-warning-700 hover:bg-warning/30 hover:text-warning-900',
    },
    {
      variant: 'plain',
      color: 'error',
      class: 'text-error hover:bg-error/10 hover:text-error-800',
    },
    {
      variant: 'outlined',
      color: 'primary',
      class: 'border-primary text-primary hover:bg-primary/10',
    },
    {
      variant: 'outlined',
      color: 'warning',
      class: 'border-warning-600 text-warning-700 hover:bg-warning/10',
    },
    {
      variant: 'outlined',
      color: 'error',
      class: 'border-error text-error hover:bg-error/10',
    },
    {
      variant: 'solid',
      color: 'primary',
      class: 'bg-primary text-accent hover:bg-primary-900',
    },
    {
      variant: 'solid',
      color: 'warning',
      class: 'bg-warning text-primary hover:bg-warning-300',
    },
    {
      variant: 'solid',
      color: 'error',
      class: 'bg-error text-on-error hover:bg-error-800',
    },
  ],
  defaultVariants: {
    variant: 'plain',
    color: 'primary',
  },
});

type IconButtonVariants = VariantProps<typeof iconButton>;

const props = withDefaults(
  defineProps<{
    variant?: IconButtonVariants['variant'];
    color?: IconButtonVariants['color'];
    tooltip?: string;
  }>(),
  {
    variant: 'plain',
    color: 'primary',
    tooltip: undefined,
  },
);

const attrs = useAttrs();

const buttonClass = computed(() =>
  iconButton({
    variant: props.variant,
    color: props.color,
    class: attrs.class as string,
  }),
);

const buttonAttrs = computed(() => {
  const { class: _, ...rest } = attrs;
  if (props.tooltip && !('aria-label' in rest)) {
    return { ...rest, 'aria-label': props.tooltip };
  }
  return rest;
});

const isDisabled = computed(() => Boolean(buttonAttrs.value.disabled));
</script>

<template>
  <UiTooltip v-if="tooltip" :content="tooltip">
    <span v-if="isDisabled" tabindex="0" class="inline-flex">
      <button
        type="button"
        v-bind="buttonAttrs"
        :class="[buttonClass, 'pointer-events-none']"
      >
        <slot />
      </button>
    </span>
    <button v-else type="button" v-bind="buttonAttrs" :class="buttonClass">
      <slot />
    </button>
  </UiTooltip>
  <button v-else type="button" v-bind="buttonAttrs" :class="buttonClass">
    <slot />
  </button>
</template>
