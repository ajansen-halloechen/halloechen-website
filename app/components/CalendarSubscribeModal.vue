<script setup lang="ts">
import {
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline';

const open = defineModel<boolean>('open', { default: false });

const { success, error: toastError } = useToast();

const feedUrl = ref('');
const loading = ref(false);
const loadError = ref(false);

watch(open, async (isOpen) => {
  if (!isOpen || feedUrl.value) return;

  loading.value = true;
  loadError.value = false;

  try {
    const data = await $fetch<{ url: string }>('/api/calendar-feed-url');
    feedUrl.value = data.url;
  } catch {
    loadError.value = true;
    toastError('Kalender-Link konnte nicht geladen werden.');
  } finally {
    loading.value = false;
  }
});

async function copyUrl() {
  if (!feedUrl.value) return;

  try {
    await navigator.clipboard.writeText(feedUrl.value);
    success('Link wurde kopiert.');
  } catch {
    toastError('Link konnte nicht kopiert werden.');
  }
}
</script>

<template>
  <UiModal v-model:open="open" title="Kalender abonnieren">
    <template #trigger>
      <UiIconButton variant="solid" tooltip="Kalender abonnieren">
        <ArrowDownTrayIcon class="size-6" />
      </UiIconButton>
    </template>

    <div class="flex flex-col gap-4">
      <p>
        Kopiere den Link und abonniere ihn in der Kalender-App deines Geräts
        (z.&nbsp;B. iPhone-Kalender, Google Calendar oder Outlook).
      </p>
      <div v-if="loading" class="text-sm text-primary/60">
        Link wird geladen…
      </div>
      <div v-else-if="loadError" class="text-sm text-error">
        Der Kalender-Feed ist nicht konfiguriert oder konnte nicht geladen
        werden.
      </div>
      <UiInputField v-else id="calendar-feed-url" label="Abonnement-Link">
        <input
          id="calendar-feed-url"
          :value="feedUrl"
          type="text"
          readonly
          class="min-w-0 flex-1 bg-transparent outline-none"
          @focus="($event.target as HTMLInputElement).select()"
        />
        <UiIconButton
          tooltip="Link kopieren"
          :disabled="!feedUrl"
          @click="copyUrl"
        >
          <ClipboardDocumentIcon class="size-5" />
        </UiIconButton>
      </UiInputField>
    </div>
  </UiModal>
</template>
