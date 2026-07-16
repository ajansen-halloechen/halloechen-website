<script setup lang="ts">
import type { User } from '~~/shared/types/user';

defineProps<{
  user?: User;
}>();

const open = defineModel<boolean>('open', { default: false });

function getUserDisplayName(user: User): string | null {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return null;
}

function getUserStatus(user: User): string {
  return user.isPending ? 'Eingeladen' : 'Aktiv';
}

function getRoleLabel(role: User['role']): string {
  return role === 'admin' ? 'Admin' : 'User';
}
</script>

<template>
  <UiModal
    v-model:open="open"
    :title="user ? (getUserDisplayName(user) ?? user.email) : 'Genoss*in'"
  >
    <div v-if="user" class="flex flex-col items-center gap-6">
      <UiUserAvatar
        :src="user.avatar"
        :alt="getUserDisplayName(user) ?? user.email"
        class="size-48"
      />

      <dl class="w-full grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
        <dt class="font-medium text-on-surface/70">E-Mail</dt>
        <dd>
          <a
            :href="`mailto:${user.email}`"
            class="text-primary hover:underline"
          >
            {{ user.email }}
          </a>
        </dd>

        <dt class="font-medium text-on-surface/70">Telefon</dt>
        <dd>
          <a
            v-if="user.phoneNumber"
            :href="`tel:${user.phoneNumber.replace(/\s/g, '')}`"
            class="text-primary hover:underline"
          >
            {{ user.phoneNumber }}
          </a>
          <span v-else>–</span>
        </dd>

        <dt class="font-medium text-on-surface/70">Status</dt>
        <dd>{{ getUserStatus(user) }}</dd>

        <dt class="font-medium text-on-surface/70">Rolle</dt>
        <dd>{{ getRoleLabel(user.role) }}</dd>
      </dl>
    </div>
  </UiModal>
</template>
