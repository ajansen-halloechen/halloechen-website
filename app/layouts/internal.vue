<script setup lang="ts">
import TopBar from '~/components/TopBar.vue';
import InternalFooterBar from '~/components/InternalFooterBar.vue';
import { internalNavItems } from '~/utils/internal-navigation';

const route = useRoute();

const activeItem = computed(() => {
  const match = internalNavItems.find((item) => route.path === item.to);
  return match?.id ?? '';
});
</script>

<template>
  <div
    class="h-dvh flex flex-col overflow-hidden bg-gradient-to-r from-primary/10 md:from-primary/20 via-background/95 to-primary/10 md:to-primary/20"
  >
    <header class="shrink-0 z-50 backdrop-blur-3xl">
      <TopBar
        :items="internalNavItems"
        :active-item="activeItem"
        breakpoint="xl"
        :show-marquee="false"
      />
    </header>

    <main class="flex-1 min-h-0 overflow-y-auto flex flex-col w-full">
      <slot />
    </main>

    <footer class="shrink-0">
      <InternalFooterBar />
    </footer>

    <UiToaster />
  </div>
</template>
