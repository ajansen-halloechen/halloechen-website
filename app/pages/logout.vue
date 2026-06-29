<script setup lang="ts">
const { clear } = useUserSession();
const loading = ref(false);

async function handleLogout() {
  loading.value = true;
  try {
    await clear();
    await navigateTo('/');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiAuthPanel>
    <template #heading>Von internen Bereich abmelden</template>
    <p class="text-center">
      Willst du dich abmelden oder nur zurück zur öffentlichen Webseite?
    </p>
    <div class="flex flex-col gap-2">
      <UiButton variant="outlined" class="w-full" @click="navigateTo('/')">
        Zur Webseite
      </UiButton>
      <UiButton :disabled="loading" class="w-full" @click="handleLogout">
        {{ loading ? 'Abmelden…' : 'Abmelden' }}
      </UiButton>
    </div>
  </UiAuthPanel>
</template>
