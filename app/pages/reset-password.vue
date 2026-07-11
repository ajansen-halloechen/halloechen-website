<script setup lang="ts">
import {
  PASSWORD_REQUIREMENTS_HINT,
  passwordValidationMessage,
  validatePassword,
} from '~~/shared/password';

const route = useRoute();

const token = computed(() => {
  const value = route.query.token;
  return typeof value === 'string' ? value : '';
});

const password = ref('');
const error = ref('');
const passwordError = ref('');
const loading = ref(false);

const tokenMissing = computed(() => !token.value);

async function handleReset() {
  error.value = '';
  passwordError.value = '';

  const passwordValidationError = validatePassword(password.value);
  if (passwordValidationError) {
    passwordError.value = passwordValidationMessage(passwordValidationError);
    return;
  }

  loading.value = true;

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
      },
    });
    await navigateTo('/login?reset=success');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 400
    ) {
      error.value = 'Der Link ist ungültig oder abgelaufen.';
    } else {
      error.value = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiAuthPanel>
    <template #heading>Passwort zurücksetzen</template>
    <div
      v-if="tokenMissing"
      class="px-4 py-2 bg-error text-sm text-on-error rounded-md"
    >
      Kein gültiger Link. Bitte verwende den Link aus deiner E-Mail.
    </div>
    <form v-else class="flex flex-col gap-4" @submit.prevent="handleReset">
      <div
        v-if="error"
        class="px-4 py-2 bg-error text-sm text-on-error rounded-md"
      >
        {{ error }}
      </div>
      <div class="flex flex-col gap-1">
        <UiInputField
          id="new-password"
          v-model="password"
          label="Neues Passwort"
          type="password"
          required
          autocomplete="new-password"
        />
        <p class="text-sm text-on-surface/70">
          {{ PASSWORD_REQUIREMENTS_HINT }}
        </p>
        <p v-if="passwordError" class="text-sm text-red-600">
          {{ passwordError }}
        </p>
      </div>
      <UiButton type="submit" :disabled="loading" class="w-full">
        {{ loading ? 'Speichern…' : 'Passwort speichern' }}
      </UiButton>
    </form>
  </UiAuthPanel>
</template>
