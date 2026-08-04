<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectIcon,
} from 'reka-ui';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

export type SelectOption = {
  value: string;
  label: string;
};

const model = defineModel<string>({ required: true });

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    options: SelectOption[];
    required?: boolean;
  }>(),
  {
    required: false,
  },
);

const selectedOption = computed(() =>
  props.options.find((option) => option.value === model.value),
);
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="block font-medium">
      {{ label
      }}<span
        v-if="required"
        class="ml-0.5 align-super text-xs leading-none text-red-500"
        >*</span
      >
    </label>

    <SelectRoot v-model="model" :required="required">
      <SelectTrigger
        :id="id"
        class="flex min-w-0 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-surface px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary data-[placeholder]:text-gray-400"
      >
        <SelectValue :aria-label="selectedOption?.label">
          <slot name="value" :value="model">
            {{ selectedOption?.label }}
          </slot>
        </SelectValue>
        <SelectIcon class="shrink-0 text-primary">
          <ChevronDownIcon class="size-4" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="4"
          class="pointer-events-auto z-[100] w-[var(--reka-select-trigger-width)] overflow-hidden rounded-md border border-primary bg-surface shadow-md"
        >
          <SelectViewport class="p-1">
            <SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              :text-value="option.label"
              class="relative flex cursor-pointer items-center rounded px-2 py-1.5 outline-none data-[highlighted]:bg-primary/10"
            >
              <SelectItemText>
                <slot name="option" :option="option">
                  {{ option.label }}
                </slot>
              </SelectItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>
