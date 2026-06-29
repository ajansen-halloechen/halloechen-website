<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  loading?: boolean;
}>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  confirm: [];
}>();
</script>

<template>
  <UiModal v-model:open="open" :title="title">
    <p class="text-gray-600">
      {{ description }}
    </p>
    <div class="mt-6 flex justify-end gap-2">
      <UiButton variant="outlined" :disabled="loading" @click="open = false">
        Abbrechen
      </UiButton>
      <UiButton color="error" :disabled="loading" @click="emit('confirm')">
        {{ loading ? 'Löschen…' : 'Löschen' }}
      </UiButton>
    </div>
  </UiModal>
</template>
