<script setup lang="ts">
definePageMeta({ layout: 'internal', middleware: ['auth'] });
</script>

<template>
  <UiPage heading="Schichtblocker" size="xl">
    <ShiftBlockerTable />
  </UiPage>
</template>
