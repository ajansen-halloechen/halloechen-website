<script setup lang="ts">
import {
    PopoverRoot,
    PopoverTrigger,
    PopoverContent,
} from 'reka-ui';
</script>

<template>
    <PopoverRoot>
        <PopoverTrigger as-child>
            <slot name="trigger" />
        </PopoverTrigger>
        <PopoverContent
side="bottom" :side-offset="4" align="start"
            class="z-40 rounded-md border border-primary bg-surface p-3 shadow-md">
            <slot />
        </PopoverContent>
    </PopoverRoot>
</template>
