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
import type { CalendarEntryType } from '~~/shared/types/calendar-entry';
import {
  calendarEntryTypeLabels,
  calendarEntryTypes,
} from '~/utils/calendar-entry';

const model = defineModel<CalendarEntryType>({ required: true });

withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    required?: boolean;
  }>(),
  {
    id: 'calendar-entry-type',
    label: 'Typ',
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
        class="flex min-w-0 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-surface px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      >
        <SelectValue :aria-label="calendarEntryTypeLabels[model]">
          <CalendarEntryTypeBadge :type="model" />
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
              v-for="entryType in calendarEntryTypes"
              :key="entryType"
              :value="entryType"
              :text-value="calendarEntryTypeLabels[entryType]"
              class="relative flex cursor-pointer items-center rounded px-2 py-1.5 outline-none data-[highlighted]:bg-primary/10"
            >
              <SelectItemText>
                <CalendarEntryTypeBadge :type="entryType" />
              </SelectItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>
