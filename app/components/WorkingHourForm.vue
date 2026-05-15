<script setup lang="ts">
import type { WorkingHour } from '~~/shared/types/working-hour';

const props = defineProps<{
    users: Record<number, string>;
    activities: string[];
    initialData?: WorkingHour;
}>();

const emit = defineEmits<{
    submit: [data: Omit<WorkingHour, 'id' | 'createdAt' | 'updatedAt'>];
}>();

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const userId = ref(props.initialData?.userId ?? Number(Object.keys(props.users)[0]));
const date = ref(props.initialData?.date ?? todayIso);
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
        <UiDateInput id="wh-date" v-model="date" label="Datum" required />

        <div class="grid grid-cols-2 gap-4">
            <UiInputField id="wh-start" v-model="startTime" label="Beginn" type="time" required />
            <UiInputField id="wh-end" v-model="endTime" label="Ende" type="time" required />
        </div>

        <div class="flex items-center gap-2">
            <input id="wh-plus-one" v-model="plusOneDay" type="checkbox" class="accent-primary" />
            <label for="wh-plus-one" class="text-sm">Ende am Folgetag (+1)</label>
        </div>

        <UiInputField id="wh-break" v-model="breakInHours" label="Pause (Stunden)" type="number" step="0.25" required />

        <UiAutocompleteField id="wh-activity" v-model="activity" label="Aktivität" :options="activities" required />

        <div class="flex justify-end gap-2 mt-2">
            <UiButton type="submit">
                Speichern
            </UiButton>
        </div>
    </form>
</template>
