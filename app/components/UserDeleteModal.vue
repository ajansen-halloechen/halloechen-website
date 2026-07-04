<script setup lang="ts">
import type { User } from '~~/shared/types/user';

const props = defineProps<{
  user?: User;
}>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  success: [];
}>();

const { success, error: toastError } = useToast();

const loading = ref(false);

function getUserDisplayName(user: User): string | null {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return null;
}

const description = computed(() => {
  if (!props.user) return '';
  const name = getUserDisplayName(props.user);
  const label = name ? `${name} (${props.user.email})` : props.user.email;
  return `Möchtest du ${label} wirklich löschen?`;
});

async function handleDelete() {
  if (!props.user) return;

  loading.value = true;

  try {
    await $fetch(`/api/users/${props.user.id}`, { method: 'DELETE' });
    open.value = false;
    success('Genoss*in wurde gelöscht.');
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
    title="Genoss*in löschen"
    :description="description"
    :loading="loading"
    @confirm="handleDelete"
  />
</template>
