<script setup lang="ts">
import { FunnelIcon } from '@heroicons/vue/24/outline';

interface FilterOption {
    value: string;
    label: string;
}

const props = defineProps<{
    options: FilterOption[];
    ariaLabel?: string;
}>();

const model = defineModel<string[]>({ required: true });

const allSelected = computed(() =>
    props.options.length > 0 && props.options.every((o) => model.value.includes(o.value)),
);

const isFiltered = computed(() =>
    props.options.length > 0 && !allSelected.value,
);

function toggleAll() {
    if (allSelected.value) {
        model.value = [];
    } else {
        model.value = props.options.map((o) => o.value);
    }
}

function toggleOption(value: string) {
    if (model.value.includes(value)) {
        model.value = model.value.filter((v) => v !== value);
    } else {
        model.value = [...model.value, value];
    }
}
</script>

<template>
    <UiPopover>
        <template #trigger>
            <UiIconButton :aria-label="ariaLabel" class="ml-1" :class="{ 'text-accent': isFiltered }">
                <FunnelIcon class="size-4" />
            </UiIconButton>
        </template>
        <div class="flex flex-col gap-1 min-w-40">
            <label
v-for="option in options" :key="option.value"
                class="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-primary/10 text-sm">
                <input
type="checkbox" :checked="model.includes(option.value)" class="accent-primary"
                    @change="toggleOption(option.value)" >
                {{ option.label }}
            </label>
            <hr class="border-primary my-1" >
            <label class="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-primary/10 text-sm">
                <input type="checkbox" :checked="allSelected" class="accent-primary" @change="toggleAll" >
                Alle
            </label>
        </div>
    </UiPopover>
</template>
