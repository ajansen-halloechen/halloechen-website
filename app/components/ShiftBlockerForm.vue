<script setup lang="ts">
export interface ShiftBlockerFormData {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
}

const props = defineProps<{
  initialData?: ShiftBlockerFormData;
}>();

const emit = defineEmits<{
  submit: [data: ShiftBlockerFormData];
}>();

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const startDate = ref(props.initialData?.startDate ?? todayIso);
const startTime = ref(props.initialData?.startTime ?? '');
const endDate = ref(props.initialData?.endDate ?? todayIso);
const endTime = ref(props.initialData?.endTime ?? '');
const description = ref(props.initialData?.description ?? '');

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      startDate.value = data.startDate;
      startTime.value = data.startTime;
      endDate.value = data.endDate;
      endTime.value = data.endTime;
      description.value = data.description;
    }
  },
);

function handleSubmit() {
  emit('submit', {
    startDate: startDate.value,
    startTime: startTime.value,
    endDate: endDate.value,
    endTime: endTime.value,
    description: description.value,
  });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <UiDateInput id="sb-start-date" v-model="startDate" label="Von (Datum)" required />

    <UiTimeInput id="sb-start-time" v-model="startTime" label="Beginn" required />

    <UiDateInput id="sb-end-date" v-model="endDate" label="Bis (Datum)" required />

    <UiTimeInput id="sb-end-time" v-model="endTime" label="Ende" required />

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
