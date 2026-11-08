<script setup lang="ts">
import type { ShiftType } from '~~/shared/types/shift-type';
import { shiftTypeColors, shiftTypeLabels } from '~/utils/shift-type';

defineProps<{
  type: ShiftType;
}>();
</script>

<template>
  <UiBadge :color="shiftTypeColors[type]">
    {{ shiftTypeLabels[type] }}
  </UiBadge>
</template>
