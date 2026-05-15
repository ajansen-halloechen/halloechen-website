<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

const props = withDefaults(defineProps<{ allowPastMonths?: boolean }>(), {
    allowPastMonths: false,
});

const selectedMonth = defineModel<Date>({ required: true });

const today = new Date();
const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const monthLabel = computed(() =>
    selectedMonth.value.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
    }),
);

const canGoPrev = computed(() => {
    if (props.allowPastMonths) return true;
    const s = selectedMonth.value;
    return (
        s.getFullYear() > currentMonthStart.getFullYear() ||
        (s.getFullYear() === currentMonthStart.getFullYear() &&
            s.getMonth() > currentMonthStart.getMonth())
    );
});

function goPrevMonth() {
    if (!canGoPrev.value) return;
    const s = selectedMonth.value;
    selectedMonth.value = new Date(s.getFullYear(), s.getMonth() - 1, 1);
}

function goNextMonth() {
    const s = selectedMonth.value;
    selectedMonth.value = new Date(s.getFullYear(), s.getMonth() + 1, 1);
}
</script>

<template>
    <div class="flex items-center justify-between">
        <UiIconButton aria-label="Previous month" :disabled="!canGoPrev" @click="goPrevMonth">
            <ChevronLeftIcon class="h-6 w-6" />
        </UiIconButton>
        <div class="text-xl font-semibold capitalize">
            {{ monthLabel }}
        </div>
        <UiIconButton aria-label="Next month" @click="goNextMonth">
            <ChevronRightIcon class="h-6 w-6" />
        </UiIconButton>
    </div>
</template>
