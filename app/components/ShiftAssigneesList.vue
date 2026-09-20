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

const pairs = computed(() => {
  const rows: string[][] = [];
  for (let i = 0; i < props.userIds.length; i += 2) {
    rows.push(props.userIds.slice(i, i + 2));
  }
  return rows;
});
</script>

<template>
  <div v-if="pairs.length" class="flex flex-col gap-2">
    <div
      v-for="(pair, index) in pairs"
      :key="index"
      class="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <div
        v-for="userId in pair"
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
  </div>
  <span v-else class="text-sm text-gray-500">{{ emptyLabel }}</span>
</template>
