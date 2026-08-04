<script setup lang="ts">
import type { CalendarEntryType } from '~~/shared/types/calendar-entry';
import {
  calendarEntryTypeLabels,
  calendarEntryTypes,
} from '~/utils/calendar-entry';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
} from '~~/shared/time-range-validation';

export interface CalendarEntryFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  type: CalendarEntryType;
}

const DEFAULT_END_TIME = '23:59';

const props = defineProps<{
  initialData?: CalendarEntryFormData;
}>();

const emit = defineEmits<{
  submit: [data: CalendarEntryFormData];
}>();

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const title = ref(props.initialData?.title ?? '');
const description = ref(props.initialData?.description ?? '');
const startDate = ref(props.initialData?.startDate ?? todayIso);
const startTime = ref(props.initialData?.startTime ?? '');
const endDate = ref(props.initialData?.endDate ?? '');
const endTime = ref(props.initialData?.endTime ?? '');
const type = ref<CalendarEntryType>(
  props.initialData?.type ?? 'publicEvent',
);
const rangeError = ref('');

const typeOptions = calendarEntryTypes.map((value) => ({
  value,
  label: calendarEntryTypeLabels[value],
}));

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      title.value = data.title;
      description.value = data.description;
      startDate.value = data.startDate;
      startTime.value = data.startTime;
      endDate.value = data.endDate;
      endTime.value = data.endTime;
      type.value = data.type;
    }
  },
);

watch([startDate, startTime, endDate, endTime], () => {
  rangeError.value = '';
});

function handleSubmit() {
  rangeError.value = '';

  const resolvedEndDate = endDate.value || startDate.value;
  const resolvedEndTime = endTime.value || DEFAULT_END_TIME;

  const rangeValidationError = validateDateTimeRange({
    startDate: startDate.value,
    startTime: startTime.value,
    endDate: resolvedEndDate,
    endTime: resolvedEndTime,
  });

  if (rangeValidationError) {
    rangeError.value = dateTimeRangeValidationMessage(rangeValidationError);
    return;
  }

  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    startDate: startDate.value,
    startTime: startTime.value,
    endDate: resolvedEndDate,
    endTime: resolvedEndTime,
    type: type.value,
  });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <UiInputField id="ce-title" v-model="title" label="Titel" required />

    <UiSelect
      id="ce-type"
      v-model="type"
      label="Typ"
      :options="typeOptions"
      required
    >
      <template #value="{ value }">
        <CalendarEntryTypeBadge :type="value as CalendarEntryType" />
      </template>
      <template #option="{ option }">
        <CalendarEntryTypeBadge :type="option.value as CalendarEntryType" />
      </template>
    </UiSelect>

    <UiDateInput
      id="ce-start-date"
      v-model="startDate"
      label="Beginn (Datum)"
      required
    />

    <UiTimeInput
      id="ce-start-time"
      v-model="startTime"
      label="Beginn (Uhrzeit)"
      required
    />

    <UiDateInput id="ce-end-date" v-model="endDate" label="Ende (Datum)" />

    <div class="flex flex-col gap-1">
      <UiTimeInput id="ce-end-time" v-model="endTime" label="Ende (Uhrzeit)" />
      <p class="text-sm text-gray-500">
        Leer lassen: gleiches Datum, 23:59.
      </p>
      <p v-if="rangeError" class="text-sm text-red-600">
        {{ rangeError }}
      </p>
    </div>

    <UiInputField
      id="ce-description"
      v-model="description"
      label="Beschreibung"
    />

    <div class="flex justify-end gap-2 mt-2">
      <UiButton type="submit"> Speichern </UiButton>
    </div>
  </form>
</template>
