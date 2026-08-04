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

withDefaults(
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
        <SelectValue as-child>
          <span class="min-w-0 flex-1 text-left">
            <slot name="value" :value="model">
              {{ options.find((option) => option.value === model)?.label }}
            </slot>
          </span>
        </SelectValue>
        <SelectIcon class="shrink-0 text-primary">
          <ChevronDownIcon class="size-4" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="4"
          class="z-50 min-w-[var(--reka-select-trigger-width)] overflow-hidden rounded-md border border-primary bg-surface shadow-md"
        >
          <SelectViewport class="p-1">
            <SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              class="relative flex cursor-pointer items-center rounded px-2 py-1.5 outline-none data-[highlighted]:bg-primary/10"
            >
              <SelectItemText as-child>
                <span class="flex items-center">
                  <slot name="option" :option="option">
                    {{ option.label }}
                  </slot>
                </span>
              </SelectItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>
