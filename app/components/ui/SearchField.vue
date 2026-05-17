<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

const model = defineModel<string>();

withDefaults(
    defineProps<{
        placeholder?: string;
    }>(),
    {
        placeholder: 'Suchen…',
    },
);
</script>

<template>
    <UiBaseInput class="w-64 md:w-80">
        <MagnifyingGlassIcon class="size-4 shrink-0 text-gray-400 mr-2" />
        <input v-model="model" type="search" :placeholder="placeholder"
            class="min-w-0 flex-1 bg-transparent outline-none" />
    </UiBaseInput>
</template>
