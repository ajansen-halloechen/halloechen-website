<script setup lang="ts">
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
} from 'reka-ui';

withDefaults(
  defineProps<{
    content: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
  }>(),
  {
    side: 'bottom',
    align: 'center',
    sideOffset: 4,
  },
);
</script>

<template>
  <TooltipRoot>
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        class="z-50 rounded-md border border-primary bg-surface px-2 py-1.5 text-sm text-primary shadow-md"
      >
        {{ content }}
        <TooltipArrow class="fill-surface" :width="11" :height="5" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>
