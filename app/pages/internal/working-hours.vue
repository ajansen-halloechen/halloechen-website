<script setup lang="ts">
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useVueTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/vue-table';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import type { Activity } from '~~/shared/types/activity';
import type { User } from '~~/shared/types/user';
import type { WorkingHour } from '~~/shared/types/working-hour';
import type { WorkingHourFormData } from '~/components/WorkingHourForm.vue';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { user: currentUser } = useUserSession();

const today = new Date();
const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const selectedMonth = ref(new Date(currentMonthStart));

const monthParam = computed(() => {
  const d = selectedMonth.value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
});

const { data: backendUsers } = await useFetch<User[]>('/api/users');
const { data: backendActivities } = await useFetch<Activity[]>('/api/activities');
const { data: workingHours, refresh: refreshWorkingHours } = await useFetch<WorkingHour[]>(
  '/api/working-hours',
  { query: { month: monthParam } },
);

const userMap = computed(() =>
  new Map((backendUsers.value ?? []).map((u) => [u.id, u])),
);

const activityMap = computed(() =>
  new Map((backendActivities.value ?? []).map((a) => [a.id, a])),
);

function getUserDisplayName(user: User): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.email;
}

const formActivityNames = computed(() =>
  (backendActivities.value ?? [])
    .map((a) => a.name)
    .sort((a, b) => a.localeCompare(b, 'de')),
);

function computeHours(row: WorkingHour): number {
  const [sh = 0, sm = 0] = row.startTime.split(':').map(Number);
  const [eh = 0, em = 0] = row.endTime.split(':').map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (row.plusOneDay) diff += 24 * 60;
  return Math.max(0, (diff / 60) - row.breakInHours);
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toIsoDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

const sorting = ref<SortingState>([{ id: 'date', desc: false }]);
const columnFilters = ref<ColumnFiltersState>([]);
const globalSearch = ref('');

const selectedUsers = ref<string[]>([]);
const selectedActivities = ref<string[]>([]);

const uniqueUserIds = computed(() =>
  [...new Set((workingHours.value ?? []).map((w) => w.userId))].sort(),
);

const uniqueActivityIds = computed(() =>
  [...new Set((workingHours.value ?? []).map((w) => w.activityId))].sort(),
);

watch(uniqueUserIds, (ids) => { selectedUsers.value = [...ids]; }, { immediate: true });
watch(uniqueActivityIds, (ids) => { selectedActivities.value = [...ids]; }, { immediate: true });

const userFilterOptions = computed(() =>
  uniqueUserIds.value.map((id) => ({
    value: id,
    label: userMap.value.get(id) ? getUserDisplayName(userMap.value.get(id)!) : id,
  })),
);

const activityFilterOptions = computed(() =>
  uniqueActivityIds.value.map((id) => ({
    value: id,
    label: activityMap.value.get(id)?.name ?? id,
  })),
);

watch([selectedUsers, selectedActivities], () => {
  const filters: ColumnFiltersState = [];
  if (selectedUsers.value.length < uniqueUserIds.value.length) {
    filters.push({ id: 'userId', value: [...selectedUsers.value] });
  }
  if (selectedActivities.value.length < uniqueActivityIds.value.length) {
    filters.push({ id: 'activityId', value: [...selectedActivities.value] });
  }
  columnFilters.value = filters;
});

async function ensureActivityExists(activityName: string): Promise<string> {
  const normalized = activityName.trim();
  const existing = (backendActivities.value ?? []).find(
    (a) => a.name.toLowerCase() === normalized.toLowerCase(),
  );
  if (existing) return existing.id;

  const activity = await $fetch<Activity>('/api/activities', {
    method: 'POST',
    body: { name: normalized },
  });

  backendActivities.value = [...(backendActivities.value ?? []), activity];
  return activity.id;
}

const columnHelper = createColumnHelper<WorkingHour>();

const columns = [
  columnHelper.accessor('userId', {
    header: 'Genoss*in',
    cell: (info) => {
      const user = userMap.value.get(info.getValue());
      return user ? getUserDisplayName(user) : info.getValue();
    },
    filterFn: (row, _columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue('userId')),
    enableSorting: false,
  }),
  columnHelper.accessor('date', {
    header: 'Datum',
    cell: (info) => formatDate(info.getValue()),
    enableSorting: true,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor('activityId', {
    header: 'Aktivität',
    cell: (info) => activityMap.value.get(info.getValue())?.name ?? info.getValue(),
    filterFn: (row, _columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue('activityId')),
    enableSorting: false,
    enableGlobalFilter: false,
  }),
  columnHelper.display({
    id: 'hours',
    header: 'Stunden',
    cell: (info) => computeHours(info.row.original).toFixed(1),
    meta: { align: 'right', shrink: true },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Aktionen',
  }),
];

const table = useVueTable({
  get data() {
    return workingHours.value ?? [];
  },
  columns,
  state: {
    get sorting() { return sorting.value; },
    get columnFilters() { return columnFilters.value; },
    get globalFilter() { return globalSearch.value; },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
  },
  globalFilterFn: (row, _columnId, filterValue: string) => {
    const search = filterValue.toLowerCase();
    const wh = row.original;
    const user = userMap.value.get(wh.userId);
    const userName = user ? getUserDisplayName(user) : wh.userId;
    const date = formatDate(wh.date);
    const activity = activityMap.value.get(wh.activityId);
    const activityName = activity?.name ?? wh.activityId;
    const hours = computeHours(wh).toFixed(1);
    return [userName, date, activityName, hours].some((v) =>
      v.toLowerCase().includes(search),
    );
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingId = ref<string | undefined>();
const editingEntry = ref<WorkingHourFormData>();

function openEditModal(entry: WorkingHour) {
  editingId.value = entry.id;
  editingEntry.value = {
    date: toIsoDateString(entry.date),
    startTime: entry.startTime,
    endTime: entry.endTime,
    breakInHours: entry.breakInHours,
    plusOneDay: entry.plusOneDay,
    activityName: activityMap.value.get(entry.activityId)?.name ?? '',
  };
  showEditModal.value = true;
}

async function handleCreate(data: WorkingHourFormData) {
  const activityId = await ensureActivityExists(data.activityName);

  await $fetch('/api/working-hours', {
    method: 'POST',
    body: {
      userId: currentUser.value!.id,
      activityId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      breakInHours: data.breakInHours,
      plusOneDay: data.plusOneDay,
    },
  });

  await refreshWorkingHours();
  showCreateModal.value = false;
}

async function handleEdit(data: WorkingHourFormData) {
  if (!editingId.value) return;

  const activityId = await ensureActivityExists(data.activityName);

  await $fetch(`/api/working-hours/${editingId.value}`, {
    method: 'PATCH',
    body: {
      activityId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      breakInHours: data.breakInHours,
      plusOneDay: data.plusOneDay,
    },
  });

  await refreshWorkingHours();
  showEditModal.value = false;
  editingEntry.value = undefined;
  editingId.value = undefined;
}

async function handleDelete(id: string) {
  await $fetch(`/api/working-hours/${id}`, { method: 'DELETE' });
  await refreshWorkingHours();
}
</script>

<template>
  <UiPage heading="Zeiterfassung" size="xl">
    <UiDataTable v-model:global-search="globalSearch" :table="table" :show-search="true">
      <template #actions>
        <UiModal v-model:open="showCreateModal" title="Arbeitszeit erfassen">
          <template #trigger>
            <UiIconButton variant="solid" aria-label="Arbeitszeit erfassen">
              <PlusIcon class="size-6" />
            </UiIconButton>
          </template>
          <WorkingHourForm :activities="formActivityNames" @submit="handleCreate" />
        </UiModal>
      </template>

      <template #toolbar>
        <CalendarHeader v-model="selectedMonth" allow-past-months />
      </template>

      <template #column-filter="{ column }">
        <UiFilterPopover
v-if="column.id === 'userId'" v-model="selectedUsers" :options="userFilterOptions"
          aria-label="Nach Genoss*in filtern" />
        <UiFilterPopover
v-if="column.id === 'activityId'" v-model="selectedActivities" :options="activityFilterOptions"
          aria-label="Nach Aktivität filtern" />
      </template>

      <template #cell="{ cell, row }">
        <template v-if="cell.column.id === 'actions'">
          <div class="flex gap-1">
            <UiIconButton
aria-label="Bearbeiten" :disabled="row.original.userId !== currentUser?.id"
              @click="openEditModal(row.original)">
              <PencilIcon class="size-5" />
            </UiIconButton>
            <UiIconButton
aria-label="Löschen" :disabled="row.original.userId !== currentUser?.id"
              @click="handleDelete(row.original.id)">
              <TrashIcon class="size-5" />
            </UiIconButton>
          </div>
        </template>
        <template v-else>
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
        </template>
      </template>
    </UiDataTable>

    <UiModal v-model:open="showEditModal" title="Arbeitszeit bearbeiten">
      <WorkingHourForm :activities="formActivityNames" :initial-data="editingEntry" @submit="handleEdit" />
    </UiModal>
  </UiPage>
</template>
