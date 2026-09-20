<script setup lang="ts">
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';

export interface PlannedShiftFormData {
  date: string;
  startTime: string;
  endTime: string;
  plusOneDay: boolean;
  comment: string | null;
  numberOfPersons: number;
}

const props = defineProps<{
  initialData?: PlannedShiftFormData;
  defaultDate?: string;
}>();

const emit = defineEmits<{
  submit: [data: PlannedShiftFormData];
}>();

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const date = ref(props.initialData?.date ?? props.defaultDate ?? todayIso);
const startTime = ref(props.initialData?.startTime ?? '18:00');
const endTime = ref(props.initialData?.endTime ?? '23:00');
const plusOneDay = ref(props.initialData?.plusOneDay ?? false);
const comment = ref(props.initialData?.comment ?? '');
const numberOfPersons = ref(String(props.initialData?.numberOfPersons ?? 2));
const rangeError = ref('');

watch([date, startTime, endTime, plusOneDay], () => {
  rangeError.value = '';
});

function handleSubmit() {
  rangeError.value = '';
  const error = validateDateTimeRange(
    workingHourToDateTimeRange({
      date: date.value,
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
    date: date.value,
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
    <UiDateInput id="ps-date" v-model="date" label="Datum" required />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 [&>*]:min-w-0">
      <UiTimeInput id="ps-start" v-model="startTime" label="Beginn" required />
      <div class="flex flex-col gap-1">
        <UiTimeInput id="ps-end" v-model="endTime" label="Ende" required />
        <p v-if="rangeError" class="text-sm text-red-600">{{ rangeError }}</p>
      </div>
    </div>

    <UiCheckbox
      id="ps-plus-one"
      v-model="plusOneDay"
      label="Ende am Folgetag"
    />

    <UiInputField id="ps-comment" v-model="comment" label="Kommentar" />

    <UiInputField
      id="ps-persons"
      v-model="numberOfPersons"
      label="Personen"
      type="number"
      required
    />

    <UiButton type="submit" class="self-end">Speichern</UiButton>
  </form>
</template>
