<script setup lang="ts">
import type { CalendarEntry } from '~~/shared/types/calendar-entry';
import { calendarEntryTypeLabels } from '~/utils/calendar-entry';

const props = defineProps<{
  entry?: CalendarEntry;
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

const description = computed(() => {
  if (!props.entry) return '';
  const date = formatDate(props.entry.startDate);
  const typeLabel = calendarEntryTypeLabels[props.entry.type];
  return `Möchtest du „${props.entry.title}“ (${typeLabel}, ${date}) wirklich löschen?`;
});

async function handleDelete() {
  if (!props.entry) return;

  loading.value = true;

  try {
    await $fetch(`/api/calendar-entries/${props.entry.id}`, {
      method: 'DELETE',
    });
    open.value = false;
    success('Kalendereintrag wurde gelöscht.');
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
    title="Kalendereintrag löschen"
    :description="description"
    :loading="loading"
    @confirm="handleDelete"
  />
</template>
