<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  success: [];
}>();

const { success, warning, error: toastError } = useToast();

const email = ref('');
const role = ref<'user' | 'admin'>('user');
const formError = ref('');
const loading = ref(false);

watch(open, (isOpen) => {
  if (isOpen) {
    email.value = '';
    role.value = 'user';
    formError.value = '';
  }
});

function resetForm() {
  email.value = '';
  role.value = 'user';
  formError.value = '';
}

async function handleSubmit() {
  if (!email.value) return;

  formError.value = '';
  loading.value = true;

  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: { email: email.value, role: role.value },
    });
    resetForm();
    open.value = false;
    success('Einladung wurde versendet.');
    emit('success');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 409
    ) {
      formError.value = 'Diese E-Mail-Adresse ist bereits registriert.';
    } else if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 502
    ) {
      resetForm();
      open.value = false;
      warning(
        'Die Genoss*in wurde angelegt, aber die E-Mail konnte nicht versendet werden. Bitte „Einladung erneut senden“ verwenden.',
      );
      emit('success');
    } else {
      toastError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiModal v-model:open="open" title="Genoss*in einladen">
    <template #trigger>
      <slot name="trigger" />
    </template>
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div
        v-if="formError"
        class="px-4 py-2 bg-error text-sm text-on-error rounded-md"
      >
        {{ formError }}
      </div>
      <UiInputField
        id="new-email"
        v-model="email"
        label="E-Mail"
        type="email"
        required
      />
      <UiInputField id="new-role" label="Rolle">
        <select
          id="new-role"
          v-model="role"
          class="min-w-0 flex-1 bg-transparent outline-none"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </UiInputField>
      <UiButton type="submit" class="self-end" :disabled="loading">
        {{ loading ? 'Einladen…' : 'Einladen' }}
      </UiButton>
    </form>
  </UiModal>
</template>
