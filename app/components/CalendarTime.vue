<script setup lang="ts">
import type { CalendarEvent } from '~/utils/calendar';

const props = defineProps<{
  event: CalendarEvent;
}>();
</script>

<template>
  <div
    class="w-full flex justify-center items-center gap-3 text-md font-semibold my-2"
  >
    <span class="h-px w-10 bg-primary/40" />
    <span class="tabular-nums">
      {{
        new Date(props.event.timestamp).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        })
      }}&nbsp;Uhr
    </span>
    <span class="h-px w-10 bg-primary/40" />
  </div>
</template>
