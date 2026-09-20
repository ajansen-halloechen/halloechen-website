<script setup lang="ts">
import type { User } from '~~/shared/types/user';
import { getUserDisplayName } from '~/utils/user-display';

withDefaults(
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
</script>

<template>
  <div v-if="userIds.length" class="flex flex-col gap-2">
    <div
      v-for="userId in userIds"
      :key="userId"
      class="flex min-w-0 items-center gap-2"
    >
      <UiUserAvatar
        :src="userMap.get(userId)?.avatar ?? null"
        :class="avatarClass"
      />
      <span class="text-sm">
        {{
          userMap.get(userId)
            ? getUserDisplayName(userMap.get(userId)!)
            : userId
        }}
      </span>
    </div>
  </div>
  <span v-else class="text-sm text-gray-500">{{ emptyLabel }}</span>
</template>
