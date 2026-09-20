<script setup lang="ts">
import type { PlannedShift } from '~~/shared/types/planned-shift';
import type { ShiftAssignmentPair } from '~~/shared/types/shift-assignment';
import type { User } from '~~/shared/types/user';
import { getUserDisplayName } from '~/utils/user-display';
import {
  formatIsoDate,
  formatTimeRange,
  weekdayLabelFromDate,
} from '~/utils/shift-plan';

const props = defineProps<{
  plannedShifts: PlannedShift[];
  assignments: ShiftAssignmentPair[];
  userMap: Map<string, User>;
  loading?: boolean;
}>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  confirm: [];
}>();

type PreviewRow = PlannedShift & {
  assignedUserIds: string[];
};

const rows = computed<PreviewRow[]>(() => {
  const byShift = new Map<string, string[]>();
  for (const assignment of props.assignments) {
    const list = byShift.get(assignment.plannedShiftId) ?? [];
    list.push(assignment.userId);
    byShift.set(assignment.plannedShiftId, list);
  }

  return [...props.plannedShifts]
    .map((shift) => ({
      ...shift,
      assignedUserIds: byShift.get(shift.id) ?? [],
    }))
    .sort((a, b) => {
      const dateA = typeof a.date === 'string' ? a.date : a.date.toISOString();
      const dateB = typeof b.date === 'string' ? b.date : b.date.toISOString();
      return dateA.localeCompare(dateB);
    });
});
</script>

<template>
  <UiModal v-model:open="open" title="Empfohlener Schichtplan" size="xl">
    <p class="mb-4 text-sm text-gray-600">
      Bitte prüfe den Vorschlag. Mit „Übernehmen“ werden alle bisherigen
      Zuordnungen für diesen Monat ersetzt.
    </p>

    <div class="max-h-[60vh] overflow-auto">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 bg-surface">
          <tr class="border-b border-primary/20">
            <th class="py-2 pr-3 font-semibold">Datum</th>
            <th class="py-2 pr-3 font-semibold">Tag</th>
            <th class="py-2 pr-3 font-semibold">Zeit</th>
            <th class="py-2 pr-3 font-semibold">Besetzung</th>
            <th class="py-2 font-semibold">Zugewiesen</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="border-b border-primary/10 align-top"
          >
            <td class="py-2 pr-3 whitespace-nowrap">
              {{ formatIsoDate(row.date) }}
            </td>
            <td class="py-2 pr-3 whitespace-nowrap">
              {{ weekdayLabelFromDate(row.date) }}
            </td>
            <td class="py-2 pr-3 whitespace-nowrap">
              {{
                formatTimeRange(row.startTime, row.endTime, row.plusOneDay)
              }}
            </td>
            <td class="py-2 pr-3 whitespace-nowrap">
              {{ row.assignedUserIds.length }}/{{ row.numberOfPersons }}
            </td>
            <td class="py-2">
              <div
                v-if="row.assignedUserIds.length"
                class="flex flex-wrap items-center gap-2"
              >
                <div
                  v-for="userId in row.assignedUserIds"
                  :key="userId"
                  class="flex items-center gap-2"
                >
                  <UiUserAvatar
                    :src="userMap.get(userId)?.avatar ?? null"
                    class="size-7"
                  />
                  <span>
                    {{
                      userMap.get(userId)
                        ? getUserDisplayName(userMap.get(userId)!)
                        : userId
                    }}
                  </span>
                </div>
              </div>
              <span v-else class="text-gray-500">Nicht besetzt</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <UiButton variant="outlined" :disabled="loading" @click="open = false">
        Abbrechen
      </UiButton>
      <UiButton :disabled="loading" @click="emit('confirm')">
        {{ loading ? 'Übernehmen…' : 'Übernehmen' }}
      </UiButton>
    </div>
  </UiModal>
</template>
