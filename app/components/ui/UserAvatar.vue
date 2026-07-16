<script setup lang="ts">
import { UserCircleIcon } from '@heroicons/vue/24/outline';
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

const showImage = computed(() => Boolean(props.src) && !failed.value);

const baseClass = computed(() =>
  twMerge('size-8 shrink-0 rounded-full', props.class),
);

const imgClass = computed(() => twMerge(baseClass.value, 'object-cover'));

const iconClass = computed(() =>
  twMerge(baseClass.value, 'text-on-surface/50'),
);

const interactiveClass =
  'cursor-pointer hover:ring-2 hover:ring-accent rounded-full';
</script>

<template>
  <button
    v-if="interactive"
    type="button"
    class="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    @click="emit('click')"
  >
    <img
      v-if="showImage"
      :src="src!"
      :alt="alt ?? ''"
      loading="lazy"
      :class="twMerge(imgClass, interactiveClass)"
      @error="failed = true"
    />
    <UserCircleIcon v-else :class="twMerge(iconClass, interactiveClass)" />
  </button>
  <template v-else>
    <img
      v-if="showImage"
      :src="src!"
      :alt="alt ?? ''"
      loading="lazy"
      :class="imgClass"
      @error="failed = true"
    />
    <UserCircleIcon v-else :class="iconClass" />
  </template>
</template>
