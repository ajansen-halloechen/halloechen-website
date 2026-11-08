<script setup lang="ts">
import type { PlannedShift } from '~~/shared/types/planned-shift';
import type {
  ShiftAssignmentPair,
  ShiftAssignmentPlanMode,
} from '~~/shared/types/shift-assignment';
import type { User } from '~~/shared/types/user';
import { getUserDisplayName } from '~/utils/user-display';
import {
  formatIsoDate,
  formatTimeRange,
  weekdayLabelFromDate,
} from '~/utils/shift-plan';

const props = withDefaults(
  defineProps<{
    plannedShifts: PlannedShift[];
    assignments: ShiftAssignmentPair[];
    existingAssignments?: readonly ShiftAssignmentPair[];
    userMap: Map<string, User>;
    planning?: boolean;
    applying?: boolean;
    hasPlan?: boolean;
    hasExistingAssignments?: boolean;
    hasOpenSlots?: boolean;
    planMode?: ShiftAssignmentPlanMode | null;
  }>(),
  {
    existingAssignments: () => [],
    planning: false,
    applying: false,
    hasPlan: false,
    hasExistingAssignments: false,
    hasOpenSlots: false,
    planMode: null,
  },
);

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  plan: [mode: ShiftAssignmentPlanMode];
  confirm: [];
  profile: [user: User];
}>();

const accordionValue = ref<string[]>(['summary', 'plan']);

const noNewAssignmentsText = 'Keine neuen Zuweisungen.';

type PreviewRow = PlannedShift & {
  assignedUserIds: string[];
};

function assignmentKey(assignment: ShiftAssignmentPair): string {
  return `${assignment.plannedShiftId}:${assignment.userId}`;
}

const isFillPreview = computed(() => props.planMode === 'fill');

const existingAssignmentKeys = computed(() => {
  const keys = new Set<string>();
  for (const assignment of props.existingAssignments) {
    keys.add(assignmentKey(assignment));
  }
  return keys;
});

/** Newly proposed pairs in fill mode; full proposal otherwise. */
const previewAssignments = computed(() => {
  if (!isFillPreview.value) return props.assignments;
  return props.assignments.filter(
    (assignment) =>
      !existingAssignmentKeys.value.has(assignmentKey(assignment)),
  );
});

const rows = computed<PreviewRow[]>(() => {
  const byShift = new Map<string, string[]>();
  for (const assignment of previewAssignments.value) {
    const list = byShift.get(assignment.plannedShiftId) ?? [];
    list.push(assignment.userId);
    byShift.set(assignment.plannedShiftId, list);
  }

  const shifts = isFillPreview.value
    ? props.plannedShifts.filter((shift) => byShift.has(shift.id))
    : props.plannedShifts;

  return shifts
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

const totalAssignedSlots = computed(() => previewAssignments.value.length);

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
  for (const assignment of previewAssignments.value) {
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

const summaryStatusText = computed(() => {
  if (isFillPreview.value) {
    const slotCount = previewAssignments.value.length;
    const shiftCount = rows.value.length;
    if (slotCount === 0) {
      return noNewAssignmentsText;
    }
    return `${slotCount} neue Zuweisung${slotCount === 1 ? '' : 'en'} in ${shiftCount} Schicht${shiftCount === 1 ? '' : 'en'}`;
  }
  return allShiftsFullyAssigned.value
    ? `Ja (${totalAssignedSlots.value}/${totalRequiredSlots.value} Schichten)`
    : `Nein (${totalAssignedSlots.value}/${totalRequiredSlots.value} Schichten)`;
});

const introText = computed(() => {
  if (props.hasExistingAssignments) {
    return 'Neu planen ersetzt alle Zuweisungen. Auffüllen behält bestehende Zuweisungen und besetzt offene Schichten.';
  }
  return 'Mit Planen wird ein Vorschlag für die Schichtbesetzung ermittelt.';
});

const confirmText = computed(() => {
  if (props.planMode === 'fill') {
    return '„Übernehmen“ behält bestehende Zuweisungen und ergänzt die neuen Vorschläge.';
  }
  return '„Übernehmen“ ersetzt alle bisherigen Zuweisungen für diesen Monat.';
});

const replaceLabel = computed(() => {
  if (props.planning && props.planMode === 'replace') {
    return props.hasExistingAssignments ? 'Neu planen…' : 'Planen…';
  }
  return props.hasExistingAssignments ? 'Neu planen' : 'Planen';
});

const fillLabel = computed(() =>
  props.planning && props.planMode === 'fill' ? 'Auffüllen…' : 'Auffüllen',
);

watch(open, (isOpen) => {
  if (isOpen) {
    accordionValue.value = ['summary', 'plan'];
  }
});
</script>

<template>
  <UiModal v-model:open="open" title="Schichten zuweisen" size="xl">
    <p class="mb-4 text-sm text-gray-600">
      {{ introText }}
    </p>
    <div class="mb-4 flex flex-wrap justify-end gap-2">
      <UiButton
        :disabled="planning || applying"
        @click="emit('plan', 'replace')"
      >
        {{ replaceLabel }}
      </UiButton>
      <UiButton
        v-if="hasExistingAssignments"
        variant="outlined"
        :disabled="planning || applying || !hasOpenSlots"
        @click="emit('plan', 'fill')"
      >
        {{ fillLabel }}
      </UiButton>
    </div>

    <UiAccordion v-if="hasPlan" v-model="accordionValue">
      <UiAccordionItem value="summary" title="Zusammenfassung">
        <div class="flex flex-col gap-3 text-sm">
          <p>
            <span class="font-medium">
              {{ isFillPreview ? 'Neu besetzt:' : 'Vollständig besetzt:' }}
            </span>
            {{ summaryStatusText }}
          </p>
          <div v-if="shiftsByUser.length">
            <p class="mb-2 font-medium">
              {{
                isFillPreview
                  ? 'Neue Schichten pro Person'
                  : 'Schichten pro Person'
              }}
            </p>
            <table class="text-sm">
              <tbody>
                <tr v-for="entry in shiftsByUser" :key="entry.userId">
                  <td class="py-1 pr-10">
                    <span class="flex items-center gap-2">
                      <UiUserAvatar
                        :src="userMap.get(entry.userId)?.avatar ?? null"
                        class="size-6"
                        :interactive="Boolean(userMap.get(entry.userId))"
                        @click="
                          userMap.get(entry.userId) &&
                          emit('profile', userMap.get(entry.userId)!)
                        "
                      />
                      <span>{{ entry.label }}</span>
                    </span>
                  </td>
                  <td class="py-1 text-right tabular-nums">
                    {{ entry.count }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-gray-500">Noch keine Zuordnungen.</p>
        </div>
      </UiAccordionItem>

      <UiAccordionItem
        value="plan"
        :title="isFillPreview ? 'Neu besetzte Schichten' : 'Schichtplan'"
      >
        <div v-if="rows.length === 0" class="text-sm text-gray-500">
          {{ noNewAssignmentsText }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-primary/20">
                <th class="py-2 pr-3 font-semibold">Datum</th>
                <th class="py-2 pr-3 font-semibold">Tag</th>
                <th class="py-2 pr-3 font-semibold">
                  {{ isFillPreview ? 'Neu zugewiesen' : 'Zugewiesen' }}
                </th>
                <th class="py-2 pr-3 font-semibold">Zeit</th>
                <th v-if="!isFillPreview" class="py-2 font-semibold">
                  Besetzung
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="border-b border-primary/10"
              >
                <td class="py-2 pr-3 align-middle whitespace-nowrap">
                  {{ formatIsoDate(row.date) }}
                </td>
                <td class="py-2 pr-3 align-middle whitespace-nowrap">
                  {{ weekdayLabelFromDate(row.date) }}
                </td>
                <td class="py-2 pr-3 align-top">
                  <ShiftAssigneesList
                    :user-ids="row.assignedUserIds"
                    :user-map="userMap"
                    avatar-class="size-7"
                    @profile="emit('profile', $event)"
                  />
                </td>
                <td class="py-2 pr-3 align-middle whitespace-nowrap">
                  {{
                    formatTimeRange(row.startTime, row.endTime, row.plusOneDay)
                  }}
                </td>
                <td
                  v-if="!isFillPreview"
                  class="py-2 align-middle whitespace-nowrap"
                >
                  {{ row.assignedUserIds.length }}/{{ row.numberOfPersons }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiAccordionItem>
    </UiAccordion>

    <p v-if="hasPlan" class="my-4 text-sm text-gray-600">
      {{ confirmText }}
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
