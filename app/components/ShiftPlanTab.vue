<script setup lang="ts">
import { SparklesIcon } from '@heroicons/vue/24/outline';
import {
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useVueTable,
  type SortingState,
} from '@tanstack/vue-table';
import type { PlannedShift } from '~~/shared/types/planned-shift';
import type {
  ShiftAssignment,
  ShiftAssignmentPair,
  ShiftAssignmentPlanResult,
} from '~~/shared/types/shift-assignment';
import type { User } from '~~/shared/types/user';
import { getUserDisplayName } from '~/utils/user-display';
import {
  formatIsoDate,
  formatTimeRange,
  monthParamFromDate,
  weekdayLabelFromDate,
} from '~/utils/shift-plan';

const props = defineProps<{
  isAdmin: boolean;
}>();

const selectedMonth = defineModel<Date>('selectedMonth', { required: true });

const { success, error: toastError } = useToast();

const monthParam = computed(() => monthParamFromDate(selectedMonth.value));

const { data: plannedShifts } = await useFetch<PlannedShift[]>(
  '/api/planned-shifts',
  { query: { month: monthParam } },
);

const { data: assignments, refresh: refreshAssignments } = await useFetch<
  ShiftAssignment[]
>('/api/shift-assignments', { query: { month: monthParam } });

const { data: backendUsers } = await useFetch<User[]>('/api/users');

const userMap = computed(
  () => new Map((backendUsers.value ?? []).map((u) => [u.id, u])),
);

type PlanRow = PlannedShift & {
  assignedUserIds: string[];
};

const rows = computed<PlanRow[]>(() => {
  const byShift = new Map<string, string[]>();
  for (const a of assignments.value ?? []) {
    const list = byShift.get(a.plannedShiftId) ?? [];
    list.push(a.userId);
    byShift.set(a.plannedShiftId, list);
  }

  return (plannedShifts.value ?? []).map((shift) => ({
    ...shift,
    assignedUserIds: byShift.get(shift.id) ?? [],
  }));
});

const sorting = ref<SortingState>([{ id: 'date', desc: false }]);
const globalSearch = ref('');

const planning = ref(false);
const applying = ref(false);
const showAssignModal = ref(false);
const proposedAssignments = ref<ShiftAssignmentPair[]>([]);

const columnHelper = createColumnHelper<PlanRow>();

const columns = [
  columnHelper.accessor('date', {
    header: 'Datum',
    cell: (info) => formatIsoDate(info.getValue()),
  }),
  columnHelper.accessor((row) => weekdayLabelFromDate(row.date), {
    id: 'weekday',
    header: 'Tag',
  }),
  columnHelper.display({
    id: 'time',
    header: 'Zeit',
    cell: (info) =>
      formatTimeRange(
        info.row.original.startTime,
        info.row.original.endTime,
        info.row.original.plusOneDay,
      ),
  }),
  columnHelper.accessor('comment', {
    header: 'Kommentar',
    cell: (info) => info.getValue() || '—',
  }),
  columnHelper.display({
    id: 'fill',
    header: 'Besetzung',
    cell: (info) =>
      `${info.row.original.assignedUserIds.length}/${info.row.original.numberOfPersons}`,
  }),
  columnHelper.display({
    id: 'assignees',
    header: 'Zugewiesen',
  }),
];

const table = useVueTable({
  get data() {
    return rows.value;
  },
  columns,
  state: {
    get sorting() {
      return sorting.value;
    },
    get globalFilter() {
      return globalSearch.value;
    },
  },
  onSortingChange: (updater) => {
    sorting.value =
      typeof updater === 'function' ? updater(sorting.value) : updater;
  },
  globalFilterFn: (row, _columnId, filterValue: string) => {
    const search = filterValue.toLowerCase();
    const r = row.original;
    const names = r.assignedUserIds
      .map((id) => {
        const u = userMap.value.get(id);
        return u ? getUserDisplayName(u) : id;
      })
      .join(' ');
    return [
      formatIsoDate(r.date),
      weekdayLabelFromDate(r.date),
      formatTimeRange(r.startTime, r.endTime, r.plusOneDay),
      r.comment ?? '',
      names,
      `${r.assignedUserIds.length}/${r.numberOfPersons}`,
    ].some((v) => v.toLowerCase().includes(search));
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

async function planShifts() {
  if (!props.isAdmin || planning.value) return;

  planning.value = true;
  try {
    const result = await $fetch<ShiftAssignmentPlanResult>(
      '/api/shift-assignments/plan',
      {
        method: 'POST',
        query: { month: monthParam.value },
      },
    );
    proposedAssignments.value = result.assignments;
    showAssignModal.value = true;
  } catch (err: unknown) {
    const statusMessage =
      err &&
      typeof err === 'object' &&
      'data' in err &&
      err.data &&
      typeof err.data === 'object' &&
      'statusMessage' in err.data &&
      typeof err.data.statusMessage === 'string'
        ? err.data.statusMessage
        : null;
    toastError(
      statusMessage ??
        'Schichten konnten nicht zugeordnet werden. Bitte versuche es erneut.',
    );
  } finally {
    planning.value = false;
  }
}

async function applyAssignments() {
  if (!props.isAdmin || applying.value) return;

  applying.value = true;
  try {
    await $fetch('/api/shift-assignments', {
      method: 'PUT',
      body: {
        month: monthParam.value,
        assignments: proposedAssignments.value,
      },
    });
    await refreshAssignments();
    showAssignModal.value = false;
    proposedAssignments.value = [];
    success('Schichtplan wurde übernommen.');
  } catch {
    toastError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
  } finally {
    applying.value = false;
  }
}
</script>

<template>
  <UiDataTable
    v-model:global-search="globalSearch"
    :table="table"
    :show-search="true"
  >
    <template #toolbar>
      <CalendarHeader v-model="selectedMonth" allow-past-months />
    </template>

    <template v-if="isAdmin" #actions>
      <UiIconButton
        variant="solid"
        tooltip="Schichten zuordnen"
        :disabled="planning || !(plannedShifts ?? []).length"
        @click="planShifts"
      >
        <SparklesIcon class="size-6" />
      </UiIconButton>
    </template>

    <template #cell="{ cell, row }">
      <template v-if="cell.column.id === 'assignees'">
        <div
          v-if="row.original.assignedUserIds.length"
          class="flex flex-wrap items-center gap-2"
        >
          <div
            v-for="userId in row.original.assignedUserIds"
            :key="userId"
            class="flex items-center gap-2"
          >
            <UiUserAvatar
              :src="userMap.get(userId)?.avatar ?? null"
              class="size-8"
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
        <span v-else class="text-sm text-gray-500">Nicht besetzt</span>
      </template>
      <template v-else>
        <FlexRender
          :render="cell.column.columnDef.cell"
          :props="cell.getContext()"
        />
      </template>
    </template>
    <template #empty>Keine Schichten in diesem Monat.</template>
  </UiDataTable>

  <ShiftPlanAssignModal
    v-model:open="showAssignModal"
    :planned-shifts="plannedShifts ?? []"
    :assignments="proposedAssignments"
    :user-map="userMap"
    :loading="applying"
    @confirm="applyAssignments"
  />
</template>
