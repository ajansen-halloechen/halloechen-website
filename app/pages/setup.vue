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
const firstName = ref('');
const lastName = ref('');
const phoneNumber = ref('');
const error = ref('');
const passwordError = ref('');
const loading = ref(false);

const tokenMissing = computed(() => !token.value);

async function handleSetup() {
  error.value = '';
  passwordError.value = '';

  const validationError = validatePassword(password.value);
  if (validationError) {
    passwordError.value = passwordValidationMessage(validationError);
    return;
  }

  loading.value = true;

  try {
    await $fetch('/api/auth/setup', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
        ...(firstName.value ? { firstName: firstName.value } : {}),
        ...(lastName.value ? { lastName: lastName.value } : {}),
        ...(phoneNumber.value ? { phoneNumber: phoneNumber.value } : {}),
      },
    });
    await navigateTo('/login');
  } catch (e: unknown) {
    if (
      typeof e === 'object'
      && e !== null
      && 'statusCode' in e
      && (e as { statusCode: unknown }).statusCode === 400
    ) {
      error.value = 'Der Einladungslink ist ungültig oder abgelaufen.';
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
    <template #heading>Konto einrichten</template>
    <div v-if="tokenMissing" class="px-4 py-2 bg-secondary text-sm text-on-secondary rounded-md">
      Kein gültiger Einladungslink. Bitte verwende den Link aus deiner Einladungs-E-Mail.
    </div>
    <form v-else class="flex flex-col gap-4" @submit.prevent="handleSetup">
      <div v-if="error" class="px-4 py-2 bg-secondary text-sm text-on-secondary rounded-md">
        {{ error }}
      </div>
      <div class="flex flex-col gap-1">
        <UiInputField
          id="password"
          v-model="password"
          label="Passwort"
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
      <UiInputField id="first-name" v-model="firstName" label="Vorname" autocomplete="given-name" />
      <UiInputField id="last-name" v-model="lastName" label="Nachname" autocomplete="family-name" />
      <UiInputField
        id="phone-number"
        v-model="phoneNumber"
        label="Telefonnummer"
        type="tel"
        autocomplete="tel"
      />
      <UiButton type="submit" :disabled="loading" class="w-full">
        {{ loading ? 'Einrichten…' : 'Konto einrichten' }}
      </UiButton>
    </form>
  </UiAuthPanel>
</template>
