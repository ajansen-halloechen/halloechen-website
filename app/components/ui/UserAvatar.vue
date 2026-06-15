<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

const props = defineProps<{
  src: string | null;
  alt?: string;
  class?: string;
  interactive?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const failed = ref(false);

watch(
  () => props.src,
  () => {
    failed.value = false;
  },
);

const imgClass = computed(() =>
  twMerge('size-8 shrink-0 rounded-full object-cover', props.class),
);
</script>

<template>
  <button
    v-if="src && !failed && interactive"
    type="button"
    class="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    @click="emit('click')"
  >
    <img
      :src="src"
      :alt="alt ?? ''"
      loading="lazy"
      :class="twMerge(imgClass, 'cursor-pointer hover:ring-2 hover:ring-accent')"
      @error="failed = true"
    />
  </button>
  <img
    v-else-if="src && !failed"
    :src="src"
    :alt="alt ?? ''"
    loading="lazy"
    :class="imgClass"
    @error="failed = true"
  />
</template>
