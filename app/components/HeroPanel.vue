<script setup lang="ts">
import { HeartIcon } from '@heroicons/vue/24/solid';
</script>

<template>
    <div class="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div class="w-full rounded-md overflow-hidden">
            <ImageCarousel />
        </div>
        <div class="w-full flex flex-col justify-center space-y-4 md:space-y-6">
            <h2 class="text-2xl md:text-3xl font-bold">Hallöchen Genoss*innen,</h2>
            <h1 class="text-lg md:text-xl">
                Willkommen in deiner genossenschaftlich geführten Kneipe in
                Berlin-Moabit.
            </h1>
            <p class="text-2xl md:text-3xl font-bold pt-4 inline-flex items-center gap-1">
                Prost!
                <HeartIcon class="size-7 md:size-8 text-secondary" />
                🍺
                <HeartIcon class="size-7 md:size-8 text-secondary" />
            </p>
        </div>
    </div>
</template>
