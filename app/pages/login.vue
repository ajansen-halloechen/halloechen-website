<script setup lang="ts">
const route = useRoute();

const email = ref('');
const password = ref('');
const error = ref('');
const resetSuccess = computed(() => route.query.reset === 'success');
const loading = ref(false);
const showForgotPasswordModal = ref(false);

const { fetch: fetchSession } = useUserSession();

async function handleLogin() {
  error.value = '';
  loading.value = true;

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    });
    await fetchSession();
    await navigateTo('/internal/working-hours');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 401
    ) {
      error.value = 'Ungültige E-Mail oder Passwort.';
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
    <template #heading>Für internen Bereich anmelden</template>
    <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
      <div
        v-if="resetSuccess"
        class="px-4 py-2 bg-primary/10 text-sm text-on-surface rounded-md"
      >
        Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt
        anmelden.
      </div>
      <div
        v-if="error"
        class="px-4 py-2 bg-error text-sm text-on-error rounded-md"
      >
        {{ error }}
      </div>
      <UiInputField
        id="email"
        v-model="email"
        label="E-Mail"
        type="email"
        required
        autocomplete="email"
      />
      <UiInputField
        id="password"
        v-model="password"
        label="Passwort"
        type="password"
        required
        autocomplete="current-password"
      />
      <button
        type="button"
        class="self-end text-sm text-on-surface/70 underline hover:text-on-surface"
        @click="showForgotPasswordModal = true"
      >
        Passwort vergessen?
      </button>

      <UiButton type="submit" :disabled="loading" class="w-full">
        {{ loading ? 'Anmelden…' : 'Anmelden' }}
      </UiButton>
    </form>
    <ForgotPasswordModal
      v-model:open="showForgotPasswordModal"
      :initial-email="email"
    />
  </UiAuthPanel>
</template>
