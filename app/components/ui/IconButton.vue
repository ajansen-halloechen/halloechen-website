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
    tooltip?: string;
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
