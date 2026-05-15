<script setup lang="ts">
import {
  DatePickerRoot,
  DatePickerField,
  DatePickerInput,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerHeader,
  DatePickerPrev,
  DatePickerHeading,
  DatePickerNext,
  DatePickerGrid,
  DatePickerGridHead,
  DatePickerGridBody,
  DatePickerGridRow,
  DatePickerHeadCell,
  DatePickerCell,
  DatePickerCellTrigger,
} from 'reka-ui';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { CalendarDate } from '@internationalized/date';

defineProps<{
  id: string;
  label: string;
  required?: boolean;
}>();

const model = defineModel<string>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CalendarDate's #private field breaks Volar's structural type checking
const internalValue = ref<any>(parseIso(model.value));

function parseIso(val: string | undefined): CalendarDate | undefined {
  if (!val) return undefined;
  const [y, m, d] = val.split('-').map(Number);
  if (y && m && d) return new CalendarDate(y, m, d);
  return undefined;
}

function toIso(val: { year: number; month: number; day: number }): string {
  return `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`;
}

watch(model, (v) => {
  const parsed = parseIso(v);
  if (parsed?.toString() !== internalValue.value?.toString()) {
    internalValue.value = parsed;
  }
});

watch(internalValue, (v) => {
  const iso = v ? toIso(v) : undefined;
  if (iso !== model.value) {
    model.value = iso;
  }
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="block text-sm font-medium">
      {{ label }}
    </label>
    <DatePickerRoot v-model="internalValue" locale="de-DE" :week-starts-on="1" close-on-select>
      <DatePickerField :id="id"
        class="flex items-center gap-0.5 rounded-md border border-gray-300 px-3 py-2 text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
        v-slot="{ segments }">
        <template v-for="item in segments" :key="item.part">
          <DatePickerInput v-if="item.part === 'literal'" :part="item.part"
            class="text-gray-400" />
          <DatePickerInput v-else :part="item.part"
            class="rounded px-0.5 outline-none focus:bg-primary/10 placeholder:text-gray-400 data-[placeholder]:text-gray-400" />
        </template>
        <DatePickerTrigger class="ml-auto cursor-pointer text-primary hover:text-primary-600">
          <CalendarIcon class="size-4" />
        </DatePickerTrigger>
      </DatePickerField>

      <DatePickerContent
        side="bottom"
        :side-offset="4"
        class="z-[60] rounded-md border border-primary bg-surface p-3 shadow-md">
        <DatePickerCalendar v-slot="{ weekDays, grid }">
          <DatePickerHeader class="flex items-center justify-between mb-2">
            <DatePickerPrev as-child>
              <UiIconButton aria-label="Vorheriger Monat">
                <ChevronLeftIcon class="size-4" />
              </UiIconButton>
            </DatePickerPrev>
            <DatePickerHeading class="text-sm font-semibold" />
            <DatePickerNext as-child>
              <UiIconButton aria-label="Nächster Monat">
                <ChevronRightIcon class="size-4" />
              </UiIconButton>
            </DatePickerNext>
          </DatePickerHeader>

          <DatePickerGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse select-none">
            <DatePickerGridHead>
              <DatePickerGridRow class="flex">
                <DatePickerHeadCell v-for="day in weekDays" :key="day"
                  class="w-8 text-center text-xs font-medium text-gray-500" />
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow v-for="(week, idx) in month.rows" :key="idx" class="flex">
                <DatePickerCell v-for="day in week" :key="day.toString()" :date="day"
                  class="p-0">
                  <DatePickerCellTrigger :day="day" :month="month.value"
                    class="flex size-8 items-center justify-center rounded text-sm cursor-pointer
                      hover:bg-primary/10
                      data-[selected]:bg-primary data-[selected]:text-on-primary
                      data-[today]:font-bold
                      data-[outside-view]:text-gray-300
                      data-[disabled]:text-gray-300 data-[disabled]:cursor-not-allowed
                      data-[unavailable]:text-gray-300 data-[unavailable]:line-through" />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </DatePickerCalendar>
      </DatePickerContent>
    </DatePickerRoot>
  </div>
</template>
