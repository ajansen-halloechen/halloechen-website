<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from 'reka-ui';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

defineProps<{
  value: string;
  title: string;
}>();
</script>

<template>
  <AccordionItem
    :value="value"
    class="group rounded-md border border-primary/20 overflow-hidden"
  >
    <AccordionHeader class="flex">
      <AccordionTrigger
        class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-semibold transition-colors hover:bg-primary-50 cursor-pointer outline-none"
      >
        <span>{{ title }}</span>
        <ChevronDownIcon
          class="size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
        />
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent class="border-t border-primary/20 px-3 py-3">
      <slot />
    </AccordionContent>
  </AccordionItem>
</template>
