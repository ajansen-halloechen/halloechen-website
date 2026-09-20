<script setup lang="ts">
import { AccordionRoot } from 'reka-ui';

withDefaults(
  defineProps<{
    type?: 'single' | 'multiple';
    collapsible?: boolean;
  }>(),
  {
    type: 'multiple',
    collapsible: true,
  },
);

const modelValue = defineModel<string | string[] | undefined>('modelValue');
</script>

<template>
  <AccordionRoot
    v-model="modelValue"
    :type="type"
    :collapsible="collapsible"
    class="flex flex-col gap-2"
  >
    <slot />
  </AccordionRoot>
</template>
