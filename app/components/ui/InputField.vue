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
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="block font-medium">
      {{ label
      }}<span
        v-if="required"
        class="ml-0.5 align-super text-xs leading-none text-red-500"
        >*</span
      >
    </label>
    <UiBaseInput v-if="$slots.default">
      <slot />
    </UiBaseInput>
    <UiBaseInput
      v-else
      :id="id"
      v-model="model"
      :type="type"
      :required="required"
      :autocomplete="autocomplete"
      :step="step"
    />
  </div>
</template>
