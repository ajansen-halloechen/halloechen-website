<script setup lang="ts">
import TopBar from '~/components/TopBar.vue';
import FooterBar from '~/components/FooterBar.vue';
import { internalNavItems } from '~/utils/internal-navigation';

const route = useRoute();

const activeItem = computed(() => {
    const match = internalNavItems.find((item) => route.path === item.to);
    return match?.id ?? '';
});
</script>

<template>
    <div
        class="min-h-dvh flex flex-col bg-gradient-to-r from-primary/10 md:from-primary/20 via-background/95 to-primary/10 md:to-primary/20">
        <header class="sticky top-0 z-50 backdrop-blur-3xl">
            <TopBar :items="internalNavItems" :active-item="activeItem" breakpoint="xl" :show-marquee="false" />
        </header>

        <main class="flex-1 w-full">
            <slot />
        </main>

        <footer>
            <FooterBar />
        </footer>
    </div>
</template>
