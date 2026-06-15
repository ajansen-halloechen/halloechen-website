<script setup lang="ts">
import type { WorkingHour } from '~~/shared/types/working-hour';

const props = defineProps<{
  workingHour?: WorkingHour;
  activityName?: string;
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

function computeHours(row: WorkingHour): number {
  const [sh = 0, sm = 0] = row.startTime.split(':').map(Number);
  const [eh = 0, em = 0] = row.endTime.split(':').map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (row.plusOneDay) diff += 24 * 60;
  return Math.max(0, diff / 60 - row.breakInHours);
}

const description = computed(() => {
  if (!props.workingHour) return '';
  const date = formatDate(props.workingHour.date);
  const activity = props.activityName ?? 'Unbekannte Aktivität';
  const hours = computeHours(props.workingHour).toFixed(1);
  return `Möchtest du die Arbeitszeit vom ${date} (${activity}, ${hours} Stunden) wirklich löschen?`;
});

async function handleDelete() {
  if (!props.workingHour) return;

  loading.value = true;

  try {
    await $fetch(`/api/working-hours/${props.workingHour.id}`, {
      method: 'DELETE',
    });
    open.value = false;
    success('Arbeitszeit wurde gelöscht.');
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
    title="Arbeitszeit löschen"
    :description="description"
    :loading="loading"
    @confirm="handleDelete"
  />
</template>
