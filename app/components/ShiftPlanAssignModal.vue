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
  planning?: boolean;
  applying?: boolean;
  hasPlan?: boolean;
}>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  plan: [];
  confirm: [];
}>();

const accordionValue = ref<string[]>(['summary', 'plan']);

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

const totalRequiredSlots = computed(() =>
  props.plannedShifts.reduce((sum, shift) => sum + shift.numberOfPersons, 0),
);

const totalAssignedSlots = computed(() => props.assignments.length);

const fullyStaffedShiftCount = computed(
  () =>
    rows.value.filter(
      (row) => row.assignedUserIds.length >= row.numberOfPersons,
    ).length,
);

const allShiftsFullyAssigned = computed(
  () =>
    props.plannedShifts.length > 0 &&
    fullyStaffedShiftCount.value === props.plannedShifts.length,
);

const shiftsByUser = computed(() => {
  const counts = new Map<string, number>();
  for (const assignment of props.assignments) {
    counts.set(assignment.userId, (counts.get(assignment.userId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([userId, count]) => ({
      userId,
      count,
      label: props.userMap.get(userId)
        ? getUserDisplayName(props.userMap.get(userId)!)
        : userId,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
});

watch(open, (isOpen) => {
  if (isOpen) {
    accordionValue.value = ['summary', 'plan'];
  }
});
</script>

<template>
  <UiModal v-model:open="open" title="Schichten zuweisen" size="xl">
    <p class="mb-4 text-sm text-gray-600">
      Mit Planen wird ein Vorschlag für die Schichtbesetzung ermittelt.
    </p>
    <div class="mb-4 flex justify-end">
      <UiButton :disabled="planning || applying" @click="emit('plan')">
        {{ planning ? 'Planen…' : 'Planen' }}
      </UiButton>
    </div>

    <UiAccordion v-if="hasPlan" v-model="accordionValue">
      <UiAccordionItem value="summary" title="Zusammenfassung">
        <div class="flex flex-col gap-3 text-sm">
          <p>
            <span class="font-medium">Vollständig besetzt:</span>
            {{
              allShiftsFullyAssigned
                ? `Ja (${totalAssignedSlots}/${totalRequiredSlots} Schichten)`
                : `Nein (${totalAssignedSlots}/${totalRequiredSlots} Schichten)`
            }}
          </p>
          <div v-if="shiftsByUser.length">
            <p class="mb-2 font-medium">Schichten pro Person</p>
            <ul class="flex flex-col gap-1">
              <li
                v-for="entry in shiftsByUser"
                :key="entry.userId"
                class="flex items-center justify-between gap-3"
              >
                <span class="flex min-w-0 items-center gap-2">
                  <UiUserAvatar
                    :src="userMap.get(entry.userId)?.avatar ?? null"
                    class="size-6"
                  />
                  <span class="truncate">{{ entry.label }}</span>
                </span>
                <span class="shrink-0 tabular-nums">{{ entry.count }}</span>
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-500">Noch keine Zuordnungen.</p>
        </div>
      </UiAccordionItem>

      <UiAccordionItem value="plan" title="Schichtplan">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-primary/20">
                <th class="py-2 pr-3 font-semibold">Datum</th>
                <th class="py-2 pr-3 font-semibold">Tag</th>
                <th class="py-2 pr-3 font-semibold">Zugewiesen</th>
                <th class="py-2 pr-3 font-semibold">Zeit</th>
                <th class="py-2 font-semibold">Besetzung</th>
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
                <td class="py-2 pr-3">
                  <ShiftAssigneesList
                    :user-ids="row.assignedUserIds"
                    :user-map="userMap"
                    avatar-class="size-7"
                  />
                </td>
                <td class="py-2 pr-3 whitespace-nowrap">
                  {{
                    formatTimeRange(row.startTime, row.endTime, row.plusOneDay)
                  }}
                </td>
                <td class="py-2 whitespace-nowrap">
                  {{ row.assignedUserIds.length }}/{{ row.numberOfPersons }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiAccordionItem>
    </UiAccordion>

    <p v-if="hasPlan" class="my-4 text-sm text-gray-600">
      „Übernehmen“ ersetzt alle bisherigen Zuweisungen für diesen Monat.
    </p>
    <template #footer>
      <div v-if="hasPlan" class="flex flex-col gap-3">
        <div class="flex flex-wrap justify-end gap-2">
          <UiButton
            variant="outlined"
            :disabled="planning || applying"
            @click="open = false"
          >
            Abbrechen
          </UiButton>
          <UiButton :disabled="planning || applying" @click="emit('confirm')">
            {{ applying ? 'Übernehmen…' : 'Übernehmen' }}
          </UiButton>
        </div>
      </div>
    </template>
  </UiModal>
</template>
