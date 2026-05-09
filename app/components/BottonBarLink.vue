<script setup lang="ts">
const componentMap = {
    a: 'a' as const,
    'nuxt-link': resolveComponent('NuxtLink'),
};

const props = defineProps<{
    is: keyof typeof componentMap;
}>();
</script>

<template>
    <component
:is="componentMap[props.is]"
        class="text-sm inline-flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors duration-150 hover:bg-accent">
        <slot />
    </component>
</template>
