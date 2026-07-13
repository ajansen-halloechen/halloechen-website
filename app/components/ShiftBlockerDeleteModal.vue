<script setup lang="ts">
import type { ShiftBlocker } from '~~/shared/types/shift-blocker';

const props = defineProps<{
  shiftBlocker?: ShiftBlocker;
}>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  success: [];
}>();

const { success, error: toastError } = useToast();

const loading = ref(false);

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date: Date | string, time: string): string {
  return `${formatDate(date)} ${time.slice(0, 5)}`;
}

const confirmDescription = computed(() => {
  if (!props.shiftBlocker) return '';
  const start = formatDateTime(
    props.shiftBlocker.startDate,
    props.shiftBlocker.startTime,
  );
  const end = formatDateTime(props.shiftBlocker.endDate, props.shiftBlocker.endTime);
  const label = props.shiftBlocker.description.trim();
  if (label) {
    return `Möchtest du den Schichtblocker „${label}" vom ${start} bis ${end} wirklich löschen?`;
  }
  return `Möchtest du den Schichtblocker vom ${start} bis ${end} wirklich löschen?`;
});

async function handleDelete() {
  if (!props.shiftBlocker) return;

  loading.value = true;

  try {
    await $fetch(`/api/shift-blockers/${props.shiftBlocker.id}`, {
      method: 'DELETE',
    });
    open.value = false;
    success('Schichtblocker wurde gelöscht.');
    emit('success');
  } catch {
    toastError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiConfirmDeleteModal
    v-model:open="open"
    title="Schichtblocker löschen"
    :description="confirmDescription"
    :loading="loading"
    @confirm="handleDelete"
  />
</template>
