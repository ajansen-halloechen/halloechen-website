<script setup lang="ts">
import { Cog6ToothIcon } from '@heroicons/vue/24/outline';

const showAllUsers = defineModel<boolean>('showAllUsers', { default: false });
</script>

<template>
  <UiModal title="Einstellungen">
    <template #trigger>
      <UiIconButton variant="solid" tooltip="Einstellungen">
        <Cog6ToothIcon class="size-6" />
      </UiIconButton>
    </template>
    <UiCheckbox
      id="sb-show-all-users"
      v-model="showAllUsers"
      label="Alle Genoss*innen anzeigen"
    />
  </UiModal>
</template>
