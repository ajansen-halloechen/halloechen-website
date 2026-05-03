<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGesture } from '@vueuse/gesture';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import IconButton from './IconButton.vue';

import img1 from '@/assets/carousel/IMG_5209.JPG';
import img2 from '@/assets/carousel/IMG_5210.JPG';
import img3 from '@/assets/carousel/IMG_5211.JPG';

const images = [img1, img2, img3];

const currentIndex = ref(0);
const trackRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const isTransitioning = ref(true);

const INTERVAL_MS = 15_000;
let timer: ReturnType<typeof setInterval> | null = null;

const prefersReducedMotion = ref(false);

onMounted(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = mq.matches;
    mq.addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches;
    });
});

const trackStyle = computed(() => ({
    transform: `translateX(-${currentIndex.value * 100}%)`,
    transition: isTransitioning.value ? 'transform 500ms ease-in-out' : 'none',
}));

function goTo(index: number) {
    isTransitioning.value = true;
    currentIndex.value = index;
    resetTimer();
}

function next() {
    goTo((currentIndex.value + 1) % images.length);
}

function prev() {
    goTo((currentIndex.value - 1 + images.length) % images.length);
}

function startTimer() {
    if (prefersReducedMotion.value) return;
    timer = setInterval(next, INTERVAL_MS);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function resetTimer() {
    stopTimer();
    startTimer();
}

watch(prefersReducedMotion, (reduced) => {
    if (reduced) stopTimer();
    else startTimer();
});

onMounted(() => {
    startTimer();
});

onUnmounted(() => {
    stopTimer();
});

// Swipe handling
const SWIPE_THRESHOLD = 50;

onMounted(() => {
    if (!containerRef.value) return;

    useGesture(
        {
            onDrag({ movement: [mx], direction: [dx], cancel, last }) {
                if (last) {
                    if (Math.abs(mx) > SWIPE_THRESHOLD) {
                        if (dx < 0) next();
                        else prev();
                    }
                    cancel?.();
                }
            },
        },
        {
            domTarget: containerRef,
            eventOptions: { passive: true },
        },
    );
});
</script>

<template>
    <div ref="containerRef" class="relative w-full aspect-4/3 overflow-hidden select-none touch-pan-y" role="region"
        aria-roledescription="carousel" aria-label="Image carousel">
        <!-- Track -->
        <div ref="trackRef" class="flex h-full w-full" :style="trackStyle">
            <div v-for="(src, i) in images" :key="i" class="min-w-full h-full" role="group"
                :aria-roledescription="'slide'" :aria-label="`Slide ${i + 1} of ${images.length}`"
                :aria-hidden="i !== currentIndex">
                <img :src="src" :alt="`Carousel image ${i + 1}`" class="object-cover h-full w-full" />
            </div>
        </div>

        <!-- Arrows -->
        <IconButton class="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary bg-primary/70 hover:bg-primary/90"
            aria-label="Previous slide" @click="prev">
            <ChevronLeftIcon class="h-5 w-5" />
        </IconButton>
        <IconButton class="absolute right-2 top-1/2 -translate-y-1/2 text-tertiary bg-primary/70 hover:bg-primary/90"
            aria-label="Next slide" @click="next">
            <ChevronRightIcon class="h-5 w-5" />
        </IconButton>

        <!-- Dots -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2" role="tablist"
            aria-label="Slide navigation">
            <button v-for="(_, i) in images" :key="i"
                class="h-3 w-3 rounded-full border border-white/80 transition-colors"
                :class="i === currentIndex ? 'bg-primary' : 'bg-white/50 hover:bg-white/80'"
                :aria-label="`Go to slide ${i + 1}`" :aria-selected="i === currentIndex" role="tab" @click="goTo(i)" />
        </div>

        <!-- Screen reader live region -->
        <div class="sr-only" aria-live="polite" aria-atomic="true">
            Slide {{ currentIndex + 1 }} of {{ images.length }}
        </div>
    </div>
</template>