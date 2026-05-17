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
  ChevronUpIcon,
  ChevronDownIcon,
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
  }),
  columnHelper.accessor('activityId', {
    header: 'Aktivität',
    cell: (info) => activityMap.value.get(info.getValue())?.name ?? info.getValue(),
    filterFn: (row, _columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue('activityId')),
    enableSorting: false,
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
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
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
    <div class="flex justify-end mb-4">
      <UiModal v-model:open="showCreateModal" title="Arbeitszeit erfassen">
        <template #trigger>
          <UiIconButton variant="solid" aria-label="Arbeitszeit hinzufügen">
            <PlusIcon class="size-6" />
          </UiIconButton>
        </template>
        <WorkingHourForm :activities="formActivityNames" @submit="handleCreate" />
      </UiModal>
    </div>
    <CalendarHeader class="mb-4" v-model="selectedMonth" allow-past-months />

    <div class="mb-10 overflow-x-auto bg-surface rounded-md border border-primary">
      <table class="min-w-full divide-y divide-primary">
        <thead class="bg-gray-300">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id"
              class="px-4 py-4 text-left text-md font-semibold tracking-wider" :class="{
                'text-right': (header.column.columnDef.meta as any)?.align === 'right',
                'w-0': (header.column.columnDef.meta as any)?.shrink,
              }">
              <div class="flex items-center gap-1">
                <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                  :props="header.getContext()" />

                <!-- Sort toggle for date column -->
                <UiIconButton v-if="header.column.getCanSort()" aria-label="Sortierung umschalten" class="ml-1"
                  @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')">
                  <ChevronUpIcon v-if="header.column.getIsSorted() === 'asc'" class="size-4" />
                  <ChevronDownIcon v-else class="size-4" />
                </UiIconButton>

                <!-- Filter for userId column -->
                <UiFilterPopover v-if="header.column.id === 'userId'" v-model="selectedUsers"
                  :options="userFilterOptions" aria-label="Nach Genoss*in filtern" />

                <!-- Filter for activity column -->
                <UiFilterPopover v-if="header.column.id === 'activityId'" v-model="selectedActivities"
                  :options="activityFilterOptions" aria-label="Nach Aktivität filtern" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="table.getRowModel().rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-8 text-center text-sm text-gray-500">
              Keine Einträge vorhanden.
            </td>
          </tr>
          <tr v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-primary/10">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id"
              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700" :class="{
                'text-right': (cell.column.columnDef.meta as any)?.align === 'right',
                'w-0': (cell.column.columnDef.meta as any)?.shrink,
              }">
              <template v-if="cell.column.id === 'actions'">
                <div class="flex gap-1">
                  <UiIconButton aria-label="Bearbeiten" :disabled="row.original.userId !== currentUser?.id"
                    @click="openEditModal(row.original)">
                    <PencilIcon class="size-5" />
                  </UiIconButton>
                  <UiIconButton aria-label="Löschen" :disabled="row.original.userId !== currentUser?.id"
                    @click="handleDelete(row.original.id)">
                    <TrashIcon class="size-5" />
                  </UiIconButton>
                </div>
              </template>
              <template v-else>
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UiModal v-model:open="showEditModal" title="Arbeitszeit bearbeiten">
      <WorkingHourForm :activities="formActivityNames" :initial-data="editingEntry" @submit="handleEdit" />
    </UiModal>
  </UiPage>
</template>
