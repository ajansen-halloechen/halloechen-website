<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

const props = defineProps<{
  src: string | null;
  alt?: string;
  class?: string;
}>();

const failed = ref(false);

watch(
  () => props.src,
  () => {
    failed.value = false;
  },
);
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="alt ?? ''"
    loading="lazy"
    class="size-8 shrink-0 rounded-full object-cover"
    :class="twMerge(props.class)"
    @error="failed = true"
  />
</template>
