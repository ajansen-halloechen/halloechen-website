<script setup lang="ts">
import type { User } from '~~/shared/types/user';
import { getUserDisplayName } from '~/utils/user-display';

const props = withDefaults(
  defineProps<{
    userIds: string[];
    userMap: Map<string, User>;
    avatarClass?: string;
    emptyLabel?: string;
  }>(),
  {
    avatarClass: 'size-8',
    emptyLabel: 'Nicht besetzt',
  },
);

const emit = defineEmits<{
  profile: [user: User];
}>();

function getUser(userId: string) {
  return props.userMap.get(userId);
}
</script>

<template>
  <div v-if="userIds.length" class="flex flex-col gap-2">
    <div
      v-for="userId in userIds"
      :key="userId"
      class="flex min-w-0 items-center gap-2"
    >
      <UiUserAvatar
        :src="getUser(userId)?.avatar ?? null"
        :class="avatarClass"
        :interactive="Boolean(getUser(userId))"
        @click="getUser(userId) && emit('profile', getUser(userId)!)"
      />
      <span class="text-sm">
        {{ getUser(userId) ? getUserDisplayName(getUser(userId)!) : userId }}
      </span>
    </div>
  </div>
  <span v-else class="text-sm text-gray-500">{{ emptyLabel }}</span>
</template>
