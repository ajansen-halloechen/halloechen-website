<script setup lang="ts">
import { RouterView } from 'vue-router';
import TopBar from './components/TopBar.vue';
import FooterBar from './components/FooterBar.vue';
</script>

<template>
  <div
    class="min-h-dvh flex flex-col bg-gradient-to-r from-primary/10 md:from-primary/20 via-background/95 to-primary/10 md:to-primary/20">
    <header class="sticky top-0 z-50 backdrop-blur-3xl">
      <TopBar />
    </header>

    <main class="flex-1 w-full">
      <RouterView />
    </main>

    <footer>
      <FooterBar />
    </footer>
  </div>
</template>
