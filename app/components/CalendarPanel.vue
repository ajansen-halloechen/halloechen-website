<script setup lang="ts">
import { type CalendarEvent, getCalendarEvents } from '~/utils/calendar';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

const today = new Date();
const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const selectedMonth = ref(new Date(currentMonthStart));

const monthLabel = computed(() =>
    selectedMonth.value.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
    }),
);

const canGoPrev = computed(() => {
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

const eventsForMonth = computed<CalendarEvent[]>(() => {
    const monthStart = selectedMonth.value;
    const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
    );

    return getCalendarEvents(monthStart, monthEnd).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
});
</script>

<template>
    <div class="max-h-[75dvh] rounded-lg md:px-6 flex flex-col gap-1">
        <div class="flex items-center justify-between border-b-3 border-primary pb-2">
            <IconButton
class="disabled:opacity-30 disabled:hover:bg-transparent" aria-label="Previous month"
                :disabled="!canGoPrev" @click="goPrevMonth">
                <ChevronLeftIcon class="h-6 w-6" />
            </IconButton>
            <div class="text-xl font-semibold capitalize">
                {{ monthLabel }}
            </div>
            <IconButton aria-label="Next month" @click="goNextMonth">
                <ChevronRightIcon class="h-6 w-6" />
            </IconButton>
        </div>

        <div v-if="eventsForMonth.length" class="flex-1 overflow-y-auto">
            <div v-for="event in eventsForMonth" :key="event.id" class="py-2 border-b border-primary">
                <CalendarItem :event="event" class="md:hidden" />
                <CalendarItemMd :event="event" class="hidden md:flex" />
            </div>
        </div>
        <div v-else class="text-sm text-gray-500 italic mt-4">
            Noch sind keine Veranstaltungen für diesen Monat geplant.
        </div>
    </div>
</template>
