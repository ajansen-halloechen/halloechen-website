<script setup lang="ts">
const props = defineProps<{
  title?: string;
}>();
</script>

<template>
  <section class="min-h-[50dvh] py-10 md:py-16">
    <h2
      v-if="props.title"
      class="text-center text-2xl md:text-3xl font-bold py-8 md:py-10"
    >
      {{ props.title }}
    </h2>
    <slot />
  </section>
</template>
