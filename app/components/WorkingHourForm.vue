<script setup lang="ts">
import type { WorkingHour } from '~~/shared/types/working-hour';

const props = defineProps<{
  users: Record<number, string>;
  initialData?: WorkingHour;
}>();

const emit = defineEmits<{
  submit: [data: Omit<WorkingHour, 'id' | 'createdAt' | 'updatedAt'>];
}>();

const userId = ref(props.initialData?.userId ?? Number(Object.keys(props.users)[0]));
const date = ref(props.initialData?.date ?? '');
const startTime = ref(props.initialData?.startTime ?? '');
const endTime = ref(props.initialData?.endTime ?? '');
const breakInHours = ref(String(props.initialData?.breakInHours ?? 0));
const plusOneDay = ref(props.initialData?.plusOneDay ?? false);
const activity = ref(props.initialData?.activity ?? '');

watch(() => props.initialData, (data) => {
  if (data) {
    userId.value = data.userId;
    date.value = data.date;
    startTime.value = data.startTime;
    endTime.value = data.endTime;
    breakInHours.value = String(data.breakInHours);
    plusOneDay.value = data.plusOneDay;
    activity.value = data.activity;
  }
});

function handleSubmit() {
  emit('submit', {
    userId: userId.value,
    date: date.value,
    startTime: startTime.value,
    endTime: endTime.value,
    breakInHours: Number(breakInHours.value),
    plusOneDay: plusOneDay.value,
    activity: activity.value,
  });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1">
      <label for="wh-user" class="block text-sm font-medium">Genoss*in</label>
      <select id="wh-user" v-model="userId"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
        <option v-for="(name, id) in users" :key="id" :value="Number(id)">
          {{ name }}
        </option>
      </select>
    </div>

    <UiInputField id="wh-date" v-model="date" label="Datum" type="date" required />

    <div class="grid grid-cols-2 gap-4">
      <UiInputField id="wh-start" v-model="startTime" label="Beginn" type="time" required />
      <UiInputField id="wh-end" v-model="endTime" label="Ende" type="time" required />
    </div>

    <div class="flex items-center gap-2">
      <input id="wh-plus-one" v-model="plusOneDay" type="checkbox" class="accent-primary" />
      <label for="wh-plus-one" class="text-sm">Ende am Folgetag (+1)</label>
    </div>

    <UiInputField id="wh-break" v-model="breakInHours" label="Pause (Stunden)" type="number" required />

    <UiInputField id="wh-activity" v-model="activity" label="Aktivität" required />

    <div class="flex justify-end gap-2 mt-2">
      <UiButton type="submit">
        Speichern
      </UiButton>
    </div>
  </form>
</template>
