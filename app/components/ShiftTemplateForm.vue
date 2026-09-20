<script setup lang="ts">
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';
import { WEEKDAY_LABELS } from '~/utils/shift-plan';

export interface ShiftTemplateFormData {
  weekday: number;
  startTime: string;
  endTime: string;
  plusOneDay: boolean;
  comment: string | null;
  numberOfPersons: number;
}

const props = defineProps<{
  initialData?: ShiftTemplateFormData;
}>();

const emit = defineEmits<{
  submit: [data: ShiftTemplateFormData];
}>();

const weekday = ref(String(props.initialData?.weekday ?? 1));
const startTime = ref(props.initialData?.startTime ?? '18:00');
const endTime = ref(props.initialData?.endTime ?? '23:00');
const plusOneDay = ref(props.initialData?.plusOneDay ?? false);
const comment = ref(props.initialData?.comment ?? '');
const numberOfPersons = ref(String(props.initialData?.numberOfPersons ?? 2));
const rangeError = ref('');

watch(
  () => props.initialData,
  (data) => {
    if (!data) return;
    weekday.value = String(data.weekday);
    startTime.value = data.startTime.slice(0, 5);
    endTime.value = data.endTime.slice(0, 5);
    plusOneDay.value = data.plusOneDay;
    comment.value = data.comment ?? '';
    numberOfPersons.value = String(data.numberOfPersons);
  },
);

watch([startTime, endTime, plusOneDay], () => {
  rangeError.value = '';
});

const weekdayOptions = Object.entries(WEEKDAY_LABELS).map(([value, name]) => ({
  value,
  label: name,
}));

function handleSubmit() {
  rangeError.value = '';
  const error = validateDateTimeRange(
    workingHourToDateTimeRange({
      date: '2000-01-03',
      startTime: startTime.value,
      endTime: endTime.value,
      plusOneDay: plusOneDay.value,
    }),
  );
  if (error) {
    rangeError.value = dateTimeRangeValidationMessage(error);
    return;
  }

  const trimmedComment = comment.value.trim();
  emit('submit', {
    weekday: Number(weekday.value),
    startTime: startTime.value,
    endTime: endTime.value,
    plusOneDay: plusOneDay.value,
    comment: trimmedComment || null,
    numberOfPersons: Number(numberOfPersons.value),
  });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1">
      <label for="st-weekday" class="text-sm font-medium">Wochentag</label>
      <select
        id="st-weekday"
        v-model="weekday"
        required
        class="rounded-md border border-primary bg-surface px-3 py-2"
      >
        <option
          v-for="opt in weekdayOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 [&>*]:min-w-0">
      <UiTimeInput id="st-start" v-model="startTime" label="Beginn" required />
      <div class="flex flex-col gap-1">
        <UiTimeInput id="st-end" v-model="endTime" label="Ende" required />
        <p v-if="rangeError" class="text-sm text-red-600">{{ rangeError }}</p>
      </div>
    </div>

    <UiCheckbox
      id="st-plus-one"
      v-model="plusOneDay"
      label="Ende am Folgetag"
    />

    <UiInputField id="st-comment" v-model="comment" label="Kommentar" />

    <UiInputField
      id="st-persons"
      v-model="numberOfPersons"
      label="Personen"
      type="number"
      required
    />

    <UiButton type="submit" class="self-end">Speichern</UiButton>
  </form>
</template>
