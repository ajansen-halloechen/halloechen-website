<script setup lang="ts">
import { TooltipProvider } from 'reka-ui';
</script>

<template>
  <TooltipProvider :delay-duration="400" :skip-delay-duration="200">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </TooltipProvider>
</template>
