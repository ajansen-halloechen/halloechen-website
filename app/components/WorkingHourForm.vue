<script setup lang="ts">
export interface WorkingHourFormData {
  date: string;
  startTime: string;
  endTime: string;
  breakInHours: number;
  plusOneDay: boolean;
  activityName: string;
}

const props = defineProps<{
  activities: string[];
  initialData?: WorkingHourFormData;
}>();

const emit = defineEmits<{
  submit: [data: WorkingHourFormData];
}>();

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const date = ref(props.initialData?.date ?? todayIso);
const startTime = ref(props.initialData?.startTime ?? '');
const endTime = ref(props.initialData?.endTime ?? '');
const breakInHours = ref(String(props.initialData?.breakInHours ?? 0));
const plusOneDay = ref(props.initialData?.plusOneDay ?? false);
const activity = ref(props.initialData?.activityName ?? '');

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      date.value = data.date;
      startTime.value = data.startTime;
      endTime.value = data.endTime;
      breakInHours.value = String(data.breakInHours);
      plusOneDay.value = data.plusOneDay;
      activity.value = data.activityName;
    }
  },
);

function handleSubmit() {
  emit('submit', {
    date: date.value,
    startTime: startTime.value,
    endTime: endTime.value,
    breakInHours: Number(breakInHours.value),
    plusOneDay: plusOneDay.value,
    activityName: activity.value,
  });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <UiDateInput id="wh-date" v-model="date" label="Datum" required />

    <div class="grid grid-cols-2 gap-4">
      <UiInputField
        id="wh-start"
        v-model="startTime"
        label="Beginn"
        type="time"
        required
      />
      <UiInputField
        id="wh-end"
        v-model="endTime"
        label="Ende"
        type="time"
        required
      />
    </div>

    <div class="flex items-center gap-2">
      <input
        id="wh-plus-one"
        v-model="plusOneDay"
        type="checkbox"
        class="accent-primary"
      />
      <label for="wh-plus-one" class="text-sm">Ende am Folgetag (+1)</label>
    </div>

    <UiInputField
      id="wh-break"
      v-model="breakInHours"
      label="Pause (Stunden)"
      type="number"
      step="0.25"
      required
    />

    <UiAutocompleteField
      id="wh-activity"
      v-model="activity"
      label="Aktivität"
      :options="activities"
      required
    />

    <div class="flex justify-end gap-2 mt-2">
      <UiButton type="submit"> Speichern </UiButton>
    </div>
  </form>
</template>
