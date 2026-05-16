<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants';

const page = tv({
    base: 'flex flex-col w-full mx-auto px-4 md:px-8',
    variants: {
        size: {
            lg: 'max-w-5xl',
            xl: 'max-w-7xl',
        }
    }
});

type PageVariants = VariantProps<typeof page>;

withDefaults(
    defineProps<{
        heading?: string;
        size?: PageVariants['size'];
    }>(),
    {
        size: 'lg',
    },
);
</script>

<template>
    <div :class="page({ size })">
        <slot name="heading">
            <h1 v-if="heading" class="text-center text-2xl md:text-3xl font-bold py-8">
                {{ heading }}
            </h1>
        </slot>
        <slot />
    </div>
</template>