<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui';
import { CheckIcon } from '@heroicons/vue/24/solid';
import { tv } from 'tailwind-variants';

const model = defineModel<boolean>({ default: false });

withDefaults(
  defineProps<{
    id: string;
    label: string;
    disabled?: boolean;
    name?: string;
  }>(),
  {
    disabled: false,
    name: undefined,
  },
);

const checkbox = tv({
  slots: {
    root: [
      'flex size-5 shrink-0 items-center justify-center rounded border border-gray-300',
      'bg-surface transition-colors outline-none',
      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    indicator: 'text-on-primary',
    label: 'cursor-pointer select-none',
    field: 'flex items-center gap-2',
  },
});

const styles = checkbox();
</script>

<template>
  <div :class="styles.field()">
    <CheckboxRoot
      :id="id"
      v-model="model"
      :name="name"
      :disabled="disabled"
      :class="styles.root()"
    >
      <CheckboxIndicator :class="styles.indicator()">
        <CheckIcon class="size-3.5" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <label :for="id" :class="styles.label()">
      {{ label }}
    </label>
  </div>
</template>
