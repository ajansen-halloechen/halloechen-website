<script setup lang="ts">
import { RouterView } from 'vue-router';
import TopBar from './components/TopBar.vue';
import instagramIcon from './assets/instagram.svg?raw';
import letterIcon from './assets/letter.svg?raw';
import BottonBarLink from './components/BottonBarLink.vue';
import logoSmall from './assets/logo-small.svg?raw';
</script>

<template>
  <div
    class="min-h-dvh flex flex-col bg-gradient-to-r from-primary/10 md:from-primary/20 via-background/95 to-primary/10 md:to-primary/20">
    <header class="sticky top-0 z-50 backdrop-blur-3xl">
      <TopBar />
    </header>

    <main class="flex-1 max-w-5xl w-full mx-auto px-8">
      <RouterView />
    </main>

    <footer>
      <div class="h-52 bg-gray-900 text-on-primary">
        <div class="max-w-7xl mx-auto px-4 h-full flex items-start justify-between p-4">
          <div class="h-full max-w-[50dvw]">
            <p class="text-sm pt-2 pb-6">
              &copy; 2026 Moabiter Trinkgenossenschaft eG
            </p>
            <span class="block max-w-[50dvw] w-28 md:w-36 [&>svg]:h-auto [&>svg]:w-full" aria-hidden="true"
              v-html="logoSmall" />
          </div>
          <div class="h-full flex flex-col items-start justify-start space-y-1 md:flex-row md:space-y-0 md:space-x-2">
            <div class="flex space-x-2">
              <BottonBarLink :is="'a'" href="https://www.instagram.com/halloechen_moabit/" target="_blank"
                rel="noopener noreferrer" aria-label="Instagram">
                <span class="size-6 [&>svg]:size-full" aria-hidden="true" v-html="instagramIcon" />
              </BottonBarLink>
              <BottonBarLink :is="'a'" href="mailto:info@halloechen.org" aria-label="E-Mail an info@halloechen.org">
                <span class="size-6 [&>svg]:size-full" aria-hidden="true" v-html="letterIcon" />
              </BottonBarLink>
            </div>
            <BottonBarLink :is="'router-link'" to="/legal">
              <span>Impressum</span>
            </BottonBarLink>
            <BottonBarLink :is="'router-link'" to="/privacy">
              <span>Datenschutz</span>
            </BottonBarLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
