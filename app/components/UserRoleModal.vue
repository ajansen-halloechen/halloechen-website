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

const role = ref<'user' | 'admin'>('user');
const loading = ref(false);

function getUserDisplayName(user: User): string | null {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return null;
}

watch(open, (isOpen) => {
  if (isOpen && props.user) {
    role.value = props.user.role;
  }
});

async function handleSubmit() {
  if (!props.user) return;

  loading.value = true;

  try {
    await $fetch(`/api/users/${props.user.id}`, {
      method: 'PATCH',
      body: { role: role.value },
    });
    open.value = false;
    success('Rolle wurde geändert.');
    emit('success');
  } catch {
    toastError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiModal v-model:open="open" title="Rolle ändern">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <p class="text-sm text-gray-600">
        {{ user ? getUserDisplayName(user) : '' }}
        <span class="text-gray-400">({{ user?.email }})</span>
      </p>
      <UiInputField id="edit-role" label="Rolle">
        <select
          id="edit-role"
          v-model="role"
          class="min-w-0 flex-1 bg-transparent outline-none"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </UiInputField>
      <UiButton type="submit" class="self-end" :disabled="loading">
        {{ loading ? 'Speichern…' : 'Speichern' }}
      </UiButton>
    </form>
  </UiModal>
</template>
