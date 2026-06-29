<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

const model = defineModel<string>();

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const baseClass =
  'flex items-center w-full rounded-md border border-gray-300 bg-surface px-3 py-2 text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary';

const containerClasses = computed(() =>
  twMerge(baseClass, attrs.class as string),
);
const inputClasses = computed(() =>
  twMerge(baseClass, 'outline-none', attrs.class as string),
);

const forwardedAttrs = computed(() => {
  const { class: _, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div v-if="$slots.default" v-bind="forwardedAttrs" :class="containerClasses">
    <slot />
  </div>
  <input v-else v-model="model" v-bind="forwardedAttrs" :class="inputClasses" >
</template>
