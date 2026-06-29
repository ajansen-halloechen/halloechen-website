<script setup lang="ts">
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
import { onClickOutside, useNow } from '@vueuse/core';
import type { TopBarItem } from '~/types/top-bar';
import { getOpeningHoursMarqueeText } from '~/utils/opening-hours-marquee';
import logo from '~/assets/logo-inverted.svg?raw';

export type { TopBarItem };

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointClasses: Record<
  Breakpoint,
  { desktop: string; mobileHidden: string }
> = {
  sm: { desktop: 'hidden sm:flex', mobileHidden: 'sm:hidden' },
  md: { desktop: 'hidden md:flex', mobileHidden: 'md:hidden' },
  lg: { desktop: 'hidden lg:flex', mobileHidden: 'lg:hidden' },
  xl: { desktop: 'hidden xl:flex', mobileHidden: 'xl:hidden' },
  '2xl': { desktop: 'hidden 2xl:flex', mobileHidden: '2xl:hidden' },
};

const props = withDefaults(
  defineProps<{
    items?: TopBarItem[];
    activeItem?: string;
    breakpoint?: Breakpoint;
    showMarquee?: boolean;
  }>(),
  {
    items: () => [],
    activeItem: '',
    breakpoint: 'lg',
    showMarquee: true,
  },
);

defineEmits<{
  (e: 'navigate', item: TopBarItem): void;
}>();

const isMobileMenuOpen = ref(false);
const topBarRef = ref<HTMLElement | null>(null);

const mobileMenuHiddenClass = computed(
  () => breakpointClasses[props.breakpoint].mobileHidden,
);

const desktopNavClass = computed(
  () => breakpointClasses[props.breakpoint].desktop,
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

const now = useNow({ interval: 60_000 });

const openingHoursMarqueeText = computed(() =>
  getOpeningHoursMarqueeText(now.value),
);
</script>

<template>
  <div ref="topBarRef" class="h-24 relative">
    <div class="max-w-[120rem] mx-auto px-4 lg:px-8 h-full flex items-center">
      <slot name="logo">
        <NuxtLink to="/">
          <!-- eslint-disable vue/no-v-html -->
          <span
            class="inline-block h-20 w-auto text-accent [&>svg]:h-auto [&>svg]:w-full"
            aria-label="Hällöchen logo"
            v-html="logo"
          />
          <!-- eslint-enable vue/no-v-html -->
        </NuxtLink>
      </slot>

      <div class="ml-auto flex items-center gap-2">
        <!-- Desktop Nav (hidden entirely when showDesktopMenu is false) -->
        <nav
          v-if="items.length"
          class="space-x-6 items-center"
          :class="desktopNavClass"
        >
          <template v-for="item in items" :key="item.id">
            <UiTooltip v-if="item.icon" :content="item.tooltip!">
              <NuxtLink
                :to="item.to"
                class="inline-flex items-center hover:text-accent"
                :class="{ 'text-accent': activeItem === item.id }"
              >
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.tooltip ?? item.label"
                  class="h-10 w-10 rounded-full object-cover hover:border-2 hover:border-accent"
                />
                <component :is="item.icon" v-else class="h-6 w-6" />
              </NuxtLink>
            </UiTooltip>
            <NuxtLink
              v-else
              :to="item.to"
              class="text-xl hover:text-accent hover:font-bold"
              :class="{ 'font-bold text-accent': activeItem === item.id }"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- Burger button (always visible when showDesktopMenu is false) -->
        <UiIconButton
          v-if="items.length"
          :class="mobileMenuHiddenClass"
          aria-label="Toggle navigation menu"
          @click="toggleMobileMenu"
        >
          <span class="sr-only">Toggle navigation menu</span>
          <Bars3Icon v-if="!isMobileMenuOpen" class="h-8 w-8" />
          <XMarkIcon v-else class="h-8 w-8" />
        </UiIconButton>
      </div>
    </div>

    <!-- Mobile / popover menu -->
    <div
      v-if="isMobileMenuOpen"
      :class="mobileMenuHiddenClass"
      class="absolute right-4 lg:right-8 top-26 w-48 border-2 border-primary z-50 bg-background/90 backdrop-blur-3xl"
    >
      <nav class="flex flex-col py-2">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="item.to"
          class="px-4 py-2 text-md hover:text-accent hover:font-bold"
          :class="{ 'font-bold text-accent': activeItem === item.id }"
          @click="closeMobileMenu"
        >
          <span class="inline-flex items-center gap-2">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.tooltip ?? item.label"
              class="h-6 w-6 rounded-full object-cover"
            />
            <component :is="item.icon" v-else-if="item.icon" class="h-5 w-5" />
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
          <span>{{ openingHoursMarqueeText }}</span>
          <span class="p-8">#######</span>
          <span>
            Schaut auch auf
            <a
              class="underline"
              href="https://www.instagram.com/halloechen_moabit/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              >Instagram</a
            >
            vorbei!&nbsp;
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
