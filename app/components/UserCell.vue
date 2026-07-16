<script setup lang="ts">
import type { User } from '~~/shared/types/user';
import { getUserDisplayName } from '~/utils/user-display';

defineProps<{
  user?: User;
  part: 'avatar' | 'name';
  fallback?: string;
}>();

const emit = defineEmits<{
  profile: [user: User];
}>();
</script>

<template>
  <template v-if="part === 'avatar'">
    <div class="flex w-full justify-center px-2">
      <UiUserAvatar
        v-if="user?.avatar"
        :src="user.avatar"
        interactive
        @click="emit('profile', user!)"
      />
    </div>
  </template>
  <template v-else-if="part === 'name'">
    <span>{{ user ? getUserDisplayName(user) : (fallback ?? '') }}</span>
  </template>
</template>
