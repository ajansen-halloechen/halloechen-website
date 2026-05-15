<script setup lang="ts">
const model = defineModel<string>({ required: true });

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
</script>

<template>
    <div class="flex flex-col gap-1">
        <label :for="id" class="block text-sm font-medium">
            {{ label }}
        </label>
        <input :id="id" v-model="model" :type="type" :required="required" :autocomplete="autocomplete" :step="step"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
    </div>
</template>
