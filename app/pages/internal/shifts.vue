<script setup lang="ts">
import { UserRole } from '~~/shared/types/user';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { user: currentUser } = useUserSession();

const isAdmin = computed(() => currentUser.value?.role === UserRole.admin);

const today = new Date();
const selectedMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const activeTab = ref('plan');

const tabs = [
  { value: 'plan', label: 'Plan' },
  { value: 'availability', label: 'Verfügbarkeit' },
  { value: 'bedarf', label: 'Bedarf' },
];
</script>

<template>
  <UiPage heading="Schichtplan" size="xl">
    <div class="flex flex-col gap-6">
      <CalendarHeader v-model="selectedMonth" allow-past-months />

      <UiTabs v-model="activeTab" :tabs="tabs">
        <template #plan>
          <ShiftPlanPlanTab :selected-month="selectedMonth" />
        </template>
        <template #availability>
          <ShiftPlanAvailabilityTab
            :selected-month="selectedMonth"
            :is-admin="isAdmin"
          />
        </template>
        <template #bedarf>
          <ShiftPlanBedarfTab
            :selected-month="selectedMonth"
            :is-admin="isAdmin"
          />
        </template>
      </UiTabs>
    </div>
  </UiPage>
</template>
