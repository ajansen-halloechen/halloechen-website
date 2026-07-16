<script setup lang="ts">
import { UserRole } from '~~/shared/types/user';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { user: currentUser } = useUserSession();

const isAdmin = computed(() => currentUser.value?.role === UserRole.admin);
const showAllUsers = ref(false);
</script>

<template>
  <UiPage heading="Schichtblocker" size="xl">
    <ShiftBlockerTable :show-all-users="showAllUsers">
      <template v-if="isAdmin" #actions-prepend>
        <ShiftBlockerSettingsModal v-model:show-all-users="showAllUsers" />
      </template>
    </ShiftBlockerTable>
  </UiPage>
</template>
