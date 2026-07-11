<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  initialEmail?: string;
}>();

const { success } = useToast();

const email = ref('');
const loading = ref(false);

watch(open, (isOpen) => {
  if (isOpen) {
    email.value = props.initialEmail ?? '';
  }
});

async function handleSubmit() {
  if (!email.value) return;

  loading.value = true;

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    });
    open.value = false;
    success('Wir haben dir einen Link zum Zurücksetzen gesendet.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiModal v-model:open="open" title="Passwort zurücksetzen">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <p class="text-sm text-on-surface/70">
        Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen
        deines Passworts.
      </p>
      <UiInputField
        id="forgot-password-email"
        v-model="email"
        label="E-Mail"
        type="email"
        required
        autocomplete="email"
      />
      <div class="flex justify-end gap-2">
        <UiButton
          type="button"
          variant="outlined"
          :disabled="loading"
          @click="open = false"
        >
          Abbrechen
        </UiButton>
        <UiButton type="submit" :disabled="loading">
          {{ loading ? 'Senden…' : 'Zurücksetzen' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
