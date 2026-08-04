<script setup lang="ts">
import type { CalendarEntryType } from '~~/shared/types/calendar-entry';
import {
  calendarEntryTypeColors,
  calendarEntryTypeLabels,
} from '~/utils/calendar-entry';

defineProps<{
  type: CalendarEntryType;
}>();
</script>

<template>
  <UiBadge :color="calendarEntryTypeColors[type]">
    {{ calendarEntryTypeLabels[type] }}
  </UiBadge>
</template>
