<script setup lang="ts">
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from 'reka-ui';
import { tv } from 'tailwind-variants';

export type RadioOption = {
  value: string;
  label: string;
};

const model = defineModel<string | undefined>();

const props = withDefaults(
  defineProps<{
    options: RadioOption[];
    name?: string;
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
  }>(),
  {
    name: undefined,
    disabled: false,
    orientation: 'horizontal',
  },
);

const radio = tv({
  slots: {
    root: 'flex gap-4',
    item: 'flex items-center gap-2',
    control: [
      'flex size-5 shrink-0 items-center justify-center rounded border border-gray-300',
      'bg-surface transition-colors outline-none',
      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    indicator: 'size-2.5 rounded-sm bg-on-primary',
    label: 'cursor-pointer select-none text-sm',
  },
  variants: {
    orientation: {
      horizontal: { root: 'flex-row flex-wrap' },
      vertical: { root: 'flex-col' },
    },
  },
});

const styles = computed(() => radio({ orientation: props.orientation }));
</script>

<template>
  <RadioGroupRoot
    v-model="model"
    :name="name"
    :disabled="disabled"
    :orientation="orientation"
    :class="styles.root()"
  >
    <div
      v-for="option in options"
      :key="option.value"
      :class="styles.item()"
    >
      <RadioGroupItem
        :id="`${name ?? 'radio'}-${option.value}`"
        :value="option.value"
        :disabled="disabled"
        :class="styles.control()"
      >
        <RadioGroupIndicator :class="styles.indicator()" />
      </RadioGroupItem>
      <label
        :for="`${name ?? 'radio'}-${option.value}`"
        :class="styles.label()"
      >
        {{ option.label }}
      </label>
    </div>
  </RadioGroupRoot>
</template>
