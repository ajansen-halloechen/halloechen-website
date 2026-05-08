<script setup lang="ts">
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
import { onClickOutside } from '@vueuse/core';
import type { RouteLocationRaw } from 'vue-router';
import type { Component } from 'vue';
import logo from '~/assets/logo-inverted.svg?raw';

export interface TopBarItem {
    id: string;
    label: string;
    icon?: Component;
    tooltip?: string;
    to: RouteLocationRaw;
}

const props = withDefaults(
    defineProps<{
        items?: TopBarItem[];
        activeItem?: string;
        showDesktopMenu?: boolean;
        showMarquee?: boolean;
    }>(),
    {
        items: () => [],
        activeItem: '',
        showDesktopMenu: true,
        showMarquee: true,
    },
);

defineEmits<{
    (e: 'navigate', item: TopBarItem): void;
}>();

const isMobileMenuOpen = ref(false);
const topBarRef = ref<HTMLElement | null>(null);

const mobileMenuHiddenClass = computed(() =>
    props.showDesktopMenu ? 'md:hidden' : '',
);

const desktopNavClass = computed(() =>
    props.showDesktopMenu ? 'hidden md:flex' : 'hidden',
);

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
        <div class="max-w-[120rem] mx-auto px-4 lg:px-8 h-full flex items-center">
            <slot name="logo">
                <NuxtLink to="/">
                    <span class="inline-block h-20 w-auto text-accent [&>svg]:h-auto [&>svg]:w-full" v-html="logo"
                        aria-label="Hällöchen logo" />
                </NuxtLink>
            </slot>

            <div class="ml-auto flex items-center gap-2">
                <!-- Desktop Nav (hidden entirely when showDesktopMenu is false) -->
                <nav v-if="items.length" class="space-x-6 items-center" :class="desktopNavClass">
                    <template v-for="item in items" :key="item.id">
                        <NuxtLink v-if="item.icon" :to="item.to" :title="item.tooltip"
                            class="inline-flex items-center hover:text-accent"
                            :class="{ 'text-accent': activeItem === item.id }">
                            <component :is="item.icon" class="h-6 w-6" />
                        </NuxtLink>
                        <NuxtLink v-else :to="item.to" class="text-xl hover:text-accent hover:font-bold"
                            :class="{ 'font-bold text-accent': activeItem === item.id }">
                            {{ item.label }}
                        </NuxtLink>
                    </template>
                </nav>

                <!-- Burger button (always visible when showDesktopMenu is false) -->
                <IconButton v-if="items.length" :class="mobileMenuHiddenClass" aria-label="Toggle navigation menu"
                    @click="toggleMobileMenu">
                    <span class="sr-only">Toggle navigation menu</span>
                    <Bars3Icon v-if="!isMobileMenuOpen" class="h-8 w-8" />
                    <XMarkIcon v-else class="h-8 w-8" />
                </IconButton>
            </div>
        </div>

        <!-- Mobile / popover menu -->
        <div v-if="isMobileMenuOpen" :class="mobileMenuHiddenClass"
            class="absolute right-4 top-26 w-48 border-2 border-primary z-50 bg-background/90 backdrop-blur-3xl">
            <nav class="flex flex-col py-2">
                <NuxtLink v-for="item in items" :key="item.id" :to="item.to"
                    class="px-4 py-2 text-md hover:text-accent hover:font-bold"
                    :class="{ 'font-bold text-accent': activeItem === item.id }" @click="closeMobileMenu">
                    <span class="inline-flex items-center gap-2">
                        <component v-if="item.icon" :is="item.icon" class="h-5 w-5" />
                        {{ item.label || item.tooltip }}
                    </span>
                </NuxtLink>
            </nav>
        </div>
    </div>

    <div class="h-8 bg-primary text-on-primary overflow-hidden flex items-center">
        <div v-if="showMarquee" class="marquee flex whitespace-nowrap">
            <slot name="marquee">
                <div v-for="i in 4" :key="i">
                    <span class="p-8">#######</span>
                    <span>
                        Wir haben das BB21 übernommen und bauen gerade um - Eröffnung ist im
                        Mai geplant!!!&nbsp;
                    </span>
                    <span class="p-8">#######</span>
                    <span>
                        Coming soon - schaut auch auf
                        <a class="underline" href="https://www.instagram.com/halloechen_moabit/" target="_blank"
                            rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
                        für Updates!&nbsp;
                    </span>
                </div>
            </slot>
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
