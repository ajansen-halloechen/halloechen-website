<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { sections } from '@/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
import { onClickOutside } from '@vueuse/core';
import IconButton from './IconButton.vue';
import logo from '@/assets/logo.svg?raw';

const route = useRoute();

const isMobileMenuOpen = ref(false);
const topBarRef = ref<HTMLElement | null>(null);

// Remove HERO from sections
const filteredSections = Object.values(sections).filter(
  (section) => section.id !== sections.HERO.id,
);
const sectionIds = Object.values(filteredSections).map((section) => section.id);

const activeSection = computed(() => {
  // Get the hash from the current route, remove the leading '#'
  const hash = route.hash.replace('#', '');

  // Check if the hash corresponds to a known section
  const matchingId = sectionIds.find((id) => id === hash);
  return matchingId ?? '';
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

onClickOutside(topBarRef, () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
});
</script>

<template>
  <div ref="topBarRef" class="h-24 relative">
    <div class="max-w-7xl mx-auto px-4 h-full flex items-center">
      <RouterLink to="/">
        <span class="inline-block h-20 w-auto text-primary [&>svg]:h-auto [&>svg]:w-full bg-tertiary" v-html="logo"
          aria-label="Hällöchen logo" />

      </RouterLink>

      <div class="ml-auto flex items-center gap-2">
        <!-- Desktop Nav -->
        <nav class="space-x-6 hidden md:flex">
          <RouterLink v-for="section in filteredSections" :key="section.id" :to="{ path: '/', hash: `#${section.id}` }"
            class="text-xl hover:text-tertiary hover:font-bold"
            :class="{ 'font-bold text-tertiary': activeSection === section.id }">
            {{ section.title }}
          </RouterLink>
        </nav>

        <!-- Mobile burger button -->
        <IconButton class="md:hidden" aria-label="Toggle navigation menu" @click="toggleMobileMenu">
          <span class="sr-only">Toggle navigation menu</span>
          <Bars3Icon v-if="!isMobileMenuOpen" class="h-8 w-8" />
          <XMarkIcon v-else class="h-8 w-8" />
        </IconButton>
      </div>
    </div>

    <!-- Mobile menu popover -->
    <div v-if="isMobileMenuOpen"
      class="md:hidden absolute right-4 top-26 w-48 border-2 border-primary z-50 bg-background/90 backdrop-blur-3xl">
      <nav class="flex flex-col py-2">
        <RouterLink v-for="section in filteredSections" :key="section.id" :to="{ path: '/', hash: `#${section.id}` }"
          class="px-4 py-2 text-md hover:text-tertiary hover:font-bold"
          :class="{ 'font-bold text-tertiary': activeSection === section.id }" @click="closeMobileMenu">
          {{ section.title }}
        </RouterLink>
      </nav>
    </div>
  </div>
  <div class="h-8 bg-primary text-on-primary overflow-hidden flex items-center">
    <div class="marquee flex whitespace-nowrap">
      <div v-for="i in 4" :key="i">
        <span class="p-8">#######</span>
        <span>
          Wir haben das BB21 übernommen und bauen gerade um - Eröffnung ist im
          Mai geplant!!!&nbsp;
        </span>
        <span class="p-8">#######</span>
        <span>
          Offene Baustelle am 1. Mai - Kommt rum!!!&nbsp;
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  /* Repeated text scrolls in a seamless-looking loop */
  animation: marquee 18s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-25%);
  }
}
</style>
