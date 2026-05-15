<script setup lang="ts">
const model = defineModel<string>();

withDefaults(
    defineProps<{
        id: string;
        label: string;
        type?: string;
        required?: boolean;
        autocomplete?: string;
        step?: string;
    }>(),
    {
        type: 'text',
        required: false,
        autocomplete: undefined,
        step: undefined,
    },
);

const containerClass = 'flex items-center w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary';
</script>

<template>
    <div class="flex flex-col gap-1">
        <label :for="id" class="block text-sm font-medium">
            {{ label }}
        </label>
        <div v-if="$slots.default" :class="containerClass">
            <slot />
        </div>
        <input v-else :id="id" v-model="model" :type="type" :required="required" :autocomplete="autocomplete"
            :step="step" :class="[containerClass, 'outline-none']" />
    </div>
</template>
