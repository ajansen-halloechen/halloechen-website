<script setup lang="ts">
import { RouterLink } from 'vue-router';

const componentMap = {
  a: 'a',
  'router-link': RouterLink,
} as const;

const props = defineProps<{
  is: keyof typeof componentMap;
}>();
</script>

<template>
  <component
    :is="componentMap[props.is]"
    class="text-sm inline-flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors duration-150 hover:bg-primary"
  >
    <slot />
  </component>
</template>
