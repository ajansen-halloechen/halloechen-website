<script setup lang="ts">
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
} from '~~/shared/time-range-validation';

export interface ShiftBlockerFormData {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
}

const ALL_DAY_START_TIME = '00:00';
const ALL_DAY_END_TIME = '23:59';

const props = defineProps<{
  initialData?: ShiftBlockerFormData;
}>();

const emit = defineEmits<{
  submit: [data: ShiftBlockerFormData];
}>();

function isAllDay(startTime: string, endTime: string): boolean {
  const start = startTime.slice(0, 5);
  const end = endTime.slice(0, 5);
  return start === ALL_DAY_START_TIME && end === ALL_DAY_END_TIME;
}

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const startDate = ref(props.initialData?.startDate ?? todayIso);
const startTime = ref(props.initialData?.startTime ?? '');
const endDate = ref(props.initialData?.endDate ?? todayIso);
const endTime = ref(props.initialData?.endTime ?? '');
const description = ref(props.initialData?.description ?? '');
const allDay = ref(
  props.initialData
    ? isAllDay(props.initialData.startTime, props.initialData.endTime)
    : true,
);
const rangeError = ref('');

let savedStartTime = '';
let savedEndTime = '';

watch(allDay, (enabled) => {
  if (enabled) {
    savedStartTime = startTime.value;
    savedEndTime = endTime.value;
    startTime.value = ALL_DAY_START_TIME;
    endTime.value = ALL_DAY_END_TIME;
  } else {
    startTime.value = savedStartTime;
    endTime.value = savedEndTime;
  }
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      startDate.value = data.startDate;
      startTime.value = data.startTime;
      endDate.value = data.endDate;
      endTime.value = data.endTime;
      description.value = data.description;
      allDay.value = isAllDay(data.startTime, data.endTime);
    }
  },
);

watch([startDate, startTime, endDate, endTime, allDay], () => {
  rangeError.value = '';
});

function handleSubmit() {
  rangeError.value = '';

  const submitStartTime = allDay.value ? ALL_DAY_START_TIME : startTime.value;
  const submitEndTime = allDay.value ? ALL_DAY_END_TIME : endTime.value;

  const rangeValidationError = validateDateTimeRange({
    startDate: startDate.value,
    startTime: submitStartTime,
    endDate: endDate.value,
    endTime: submitEndTime,
  });

  if (rangeValidationError) {
    rangeError.value = dateTimeRangeValidationMessage(rangeValidationError);
    return;
  }

  emit('submit', {
    startDate: startDate.value,
    startTime: submitStartTime,
    endDate: endDate.value,
    endTime: submitEndTime,
    description: description.value,
  });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <UiCheckbox id="sb-all-day" v-model="allDay" label="Ganztägig" />

    <UiDateInput
      id="sb-start-date"
      v-model="startDate"
      label="Von (Datum)"
      required
    />

    <UiTimeInput
      v-if="!allDay"
      id="sb-start-time"
      v-model="startTime"
      label="Beginn"
      required
    />

    <div class="flex flex-col gap-1">
      <UiDateInput
        id="sb-end-date"
        v-model="endDate"
        label="Bis (Datum)"
        required
      />

      <UiTimeInput
        v-if="!allDay"
        id="sb-end-time"
        v-model="endTime"
        label="Ende"
        required
      />

      <p v-if="rangeError" class="text-sm text-red-600">
        {{ rangeError }}
      </p>
    </div>

    <UiInputField
      id="sb-description"
      v-model="description"
      label="Beschreibung"
    />

    <div class="flex justify-end gap-2 mt-2">
      <UiButton type="submit"> Speichern </UiButton>
    </div>
  </form>
</template>
