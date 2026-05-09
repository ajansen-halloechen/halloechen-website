<script setup lang="ts">
import type { CalendarEvent } from '~/utils/calendar';
import CalendarTime from './CalendarTime.vue';

const props = defineProps<{
    event: CalendarEvent;
}>();
</script>
<template>
    <div class="flex items-center justify-center gap-4 mx-8">
        <div class="flex flex-col items-center justify-center p-2">
            <div class="text-xl font-semibold leading-none">
                {{ String(new Date(props.event.timestamp).getDate()).padStart(2, '0') }}
            </div>
            <div class="text-md uppercase tracking-wide">
                {{
                    new Date(props.event.timestamp).toLocaleDateString('de-DE', {
                        weekday: 'short',
                    })
                }}
            </div>
        </div>
        <div class="flex-1 flex justify-center">
            <CalendarTime :event="props.event" />
        </div>
        <div class="flex-3">
            <div class="font-semibold">
                {{ props.event.title }}
            </div>
            <div v-if="props.event.description" class="text-md text-gray-700">
                {{ props.event.description }}
            </div>
        </div>
    </div>
</template>
