<script setup lang="ts">
import TopBar from '~/components/TopBar.vue';
import type { TopBarItem } from '~/components/TopBar.vue';
import FooterBar from '~/components/FooterBar.vue';
import { sections } from '~/utils/navigation';

const route = useRoute();

const navItems = computed<TopBarItem[]>(() =>
  Object.values(sections)
    .filter((s) => s.id !== sections.HERO.id)
    .map((s) => ({ id: s.id, label: s.title, to: { path: '/', hash: `#${s.id}` } })),
);

const activeItem = computed(() => {
  const hash = route.hash.replace('#', '');
  return navItems.value.find((item) => item.id === hash)?.id ?? '';
});
</script>

<template>
  <div
    class="min-h-dvh flex flex-col bg-gradient-to-r from-primary/10 md:from-primary/20 via-background/95 to-primary/10 md:to-primary/20">
    <header class="sticky top-0 z-50 backdrop-blur-3xl">
      <TopBar :items="navItems" :active-item="activeItem" />
    </header>

    <main class="flex-1 w-full">
      <NuxtPage />
    </main>

    <footer>
      <FooterBar />
    </footer>
  </div>
</template>
