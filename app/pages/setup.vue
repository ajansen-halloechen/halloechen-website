<script setup lang="ts">
import {
  PASSWORD_REQUIREMENTS_HINT,
  passwordValidationMessage,
  validatePassword,
} from '~~/shared/password';
import {
  normalizePhoneNumber,
  phoneValidationMessage,
  validatePhoneNumber,
} from '~~/shared/phone';

const { token, tokenMissing } = useAuthTokenFromUrl();

const password = ref('');
const firstName = ref('');
const lastName = ref('');
const phoneNumber = ref('');
const error = ref('');
const passwordError = ref('');
const phoneError = ref('');
const loading = ref(false);

const { fetch: fetchSession } = useUserSession();

async function handleSetup() {
  error.value = '';
  passwordError.value = '';
  phoneError.value = '';

  const passwordValidationError = validatePassword(password.value);
  if (passwordValidationError) {
    passwordError.value = passwordValidationMessage(passwordValidationError);
    return;
  }

  const phoneValidationError = validatePhoneNumber(phoneNumber.value);
  if (phoneValidationError) {
    phoneError.value = phoneValidationMessage(phoneValidationError);
    return;
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber.value);

  loading.value = true;

  try {
    await $fetch('/api/auth/setup', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        phoneNumber: normalizedPhoneNumber,
      },
    });
    await fetchSession();
    await navigateTo('/internal/working-hours');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 400
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
    <div
      v-if="tokenMissing"
      class="px-4 py-2 bg-error text-sm text-on-error rounded-md"
    >
      Kein gültiger Einladungslink. Bitte verwende den Link aus deiner
      Einladungs-E-Mail.
    </div>
    <form v-else class="flex flex-col gap-4" @submit.prevent="handleSetup">
      <div
        v-if="error"
        class="px-4 py-2 bg-error text-sm text-on-error rounded-md"
      >
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
      <UiInputField
        id="first-name"
        v-model="firstName"
        label="Vorname"
        required
        autocomplete="given-name"
      />
      <UiInputField
        id="last-name"
        v-model="lastName"
        label="Nachname"
        required
        autocomplete="family-name"
      />
      <div class="flex flex-col gap-1">
        <UiInputField
          id="phone-number"
          v-model="phoneNumber"
          label="Telefonnummer"
          type="tel"
          required
          autocomplete="tel"
        />
        <p v-if="phoneError" class="text-sm text-red-600">
          {{ phoneError }}
        </p>
      </div>
      <UiButton type="submit" :disabled="loading" class="w-full">
        {{ loading ? 'Einrichten…' : 'Konto einrichten' }}
      </UiButton>
    </form>
  </UiAuthPanel>
</template>
