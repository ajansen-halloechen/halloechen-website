<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

const page = tv({
    slots: {
        root: 'flex flex-col w-full mx-auto px-4 md:px-8',
        heading: 'text-center text-2xl md:text-3xl font-bold py-10 md:py-12',
        content: 'flex flex-col gap-4 md:gap-6 pb-10 md:pb-16',
    },
    variants: {
        size: {
            lg: { root: 'max-w-5xl' },
            xl: { root: 'max-w-7xl' },
        }
    }
});

type PageVariants = VariantProps<typeof page>;

const props = withDefaults(
    defineProps<{
        heading?: string;
        size?: PageVariants['size'];
        ui?: Partial<Record<keyof typeof page.slots, string>>;
    }>(),
    {
        size: 'lg',
    },
);

const slots = computed(() => {
    const { root, heading, content } = page({ size: props.size });
    return {
        root: twMerge(root(), props.ui?.root),
        heading: twMerge(heading(), props.ui?.heading),
        content: twMerge(content(), props.ui?.content),
    };
});
</script>

<template>
    <div :class="slots.root">
        <slot name="heading">
            <h1 v-if="heading" :class="slots.heading">
                {{ heading }}
            </h1>
        </slot>
        <div :class="slots.content">
            <slot />
        </div>
    </div>
</template>