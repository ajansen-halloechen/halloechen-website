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

const model = defineModel<string>({ required: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CalendarDate #private field breaks Volar structural typing
const pickerValue = ref<any>(parseIso(model.value));

function parseIso(val: string | undefined): CalendarDate | undefined {
    if (!val) return undefined;
    const [y, m, d] = val.split('-').map(Number);
    if (y && m && d) return new CalendarDate(y, m, d);
    return undefined;
}

// Model (ISO string) → picker (CalendarDate)
watch(model, (v) => {
    const parsed = parseIso(v);
    if (parsed?.toString() !== pickerValue.value?.toString()) {
        pickerValue.value = parsed;
    }
});

// Picker (CalendarDate) → model (ISO string)
watch(pickerValue, (v) => {
    if (!v) return;
    const iso = `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`;
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
        <DatePickerRoot v-model="pickerValue" locale="de-DE" :week-starts-on="1" close-on-select>
            <DatePickerField v-slot="{ segments }" :id="id"
                class="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <template v-for="item in segments" :key="item.part">
                    <DatePickerInput v-if="item.part === 'literal'" :part="item.part">
                        <span class="text-gray-400">{{ item.value }}</span>
                    </DatePickerInput>
                    <DatePickerInput v-else :part="item.part"
                        class="rounded px-1 text-center outline-none data-[placeholder]:text-gray-400 focus:bg-primary/10">
                        {{ item.value }}
                    </DatePickerInput>
                </template>
                <DatePickerTrigger as-child>
                    <button type="button" class="ml-auto cursor-pointer text-primary hover:text-primary-600"
                        aria-label="Kalender öffnen">
                        <CalendarIcon class="size-4" />
                    </button>
                </DatePickerTrigger>
            </DatePickerField>

            <DatePickerContent side="bottom" :side-offset="4"
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

                    <DatePickerGrid v-for="month in grid" :key="month.value.toString()"
                        class="w-full border-collapse select-none">
                        <DatePickerGridHead>
                            <DatePickerGridRow class="flex">
                                <DatePickerHeadCell v-for="day in weekDays" :key="day"
                                    class="w-8 text-center text-xs font-medium text-gray-500" />
                            </DatePickerGridRow>
                        </DatePickerGridHead>
                        <DatePickerGridBody>
                            <DatePickerGridRow v-for="(week, idx) in month.rows" :key="idx" class="flex">
                                <DatePickerCell v-for="day in week" :key="day.toString()" :date="day" class="p-0">
                                    <DatePickerCellTrigger :day="day" :month="month.value" class="flex size-8 items-center justify-center rounded text-sm cursor-pointer
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
