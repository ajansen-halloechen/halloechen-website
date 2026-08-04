<script setup lang="ts">
import {
  type CalendarEvent,
  calendarEntryToEvent,
} from '~/utils/calendar';
import type { CalendarEntry } from '~~/shared/types/calendar-entry';

const today = new Date();
const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const selectedMonth = ref(new Date(currentMonthStart));

const monthParam = computed(() => {
  const d = selectedMonth.value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
});

const { data: calendarEntries } = await useFetch<CalendarEntry[]>(
  '/api/public-calendar-entries',
  { query: { month: monthParam } },
);

const eventsForMonth = computed<CalendarEvent[]>(() => {
  return (calendarEntries.value ?? [])
    .map(calendarEntryToEvent)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
});
</script>

<template>
  <div class="max-h-[75dvh] rounded-lg md:px-6 flex flex-col gap-1">
    <CalendarHeader
      v-model="selectedMonth"
      class="border-b-3 border-primary pb-2"
    />

    <div v-if="eventsForMonth.length" class="flex-1 overflow-y-auto">
      <div
        v-for="event in eventsForMonth"
        :key="event.id"
        class="py-2 border-b border-primary"
      >
        <CalendarItem :event="event" class="md:hidden" />
        <CalendarItemMd :event="event" class="hidden md:flex" />
      </div>
    </div>
    <div v-else class="text-sm text-gray-500 italic mt-4">
      Noch sind keine Veranstaltungen für diesen Monat geplant.
    </div>
  </div>
</template>
