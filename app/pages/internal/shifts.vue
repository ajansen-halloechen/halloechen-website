<script setup lang="ts">
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useVueTable,
  type SortingState,
} from '@tanstack/vue-table';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { ShiftBlocker } from '~~/shared/types/shift-blocker';
import type { ShiftBlockerFormData } from '~/components/ShiftBlockerForm.vue';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const today = new Date();
const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const selectedMonth = ref(new Date(currentMonthStart));

const monthParam = computed(() => {
  const d = selectedMonth.value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
});

const { data: shiftBlockers, refresh: refreshShiftBlockers } = await useFetch<
  ShiftBlocker[]
>('/api/shift-blockers', { query: { month: monthParam } });

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date: Date | string, time: string): string {
  return `${formatDate(date)} ${time.slice(0, 5)}`;
}

function toIsoDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

const sorting = ref<SortingState>([{ id: 'startDate', desc: false }]);
const globalSearch = ref('');

const columnHelper = createColumnHelper<ShiftBlocker>();

const columns = [
  columnHelper.accessor('startDate', {
    id: 'startDate',
    header: 'Von',
    cell: (info) =>
      formatDateTime(info.getValue(), info.row.original.startTime),
    enableSorting: true,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor('endDate', {
    id: 'endDate',
    header: 'Bis',
    cell: (info) => formatDateTime(info.getValue(), info.row.original.endTime),
    enableSorting: true,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor('description', {
    header: 'Beschreibung',
    cell: (info) => info.getValue() || '—',
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Aktionen',
  }),
];

const table = useVueTable({
  get data() {
    return shiftBlockers.value ?? [];
  },
  get columns() {
    return columns;
  },
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
    const blocker = row.original;
    const start = formatDateTime(blocker.startDate, blocker.startTime);
    const end = formatDateTime(blocker.endDate, blocker.endTime);
    return [start, end, blocker.description ?? ''].some((v) =>
      v.toLowerCase().includes(search),
    );
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingId = ref<string | undefined>();
const editingEntry = ref<ShiftBlockerFormData>();
const deletingEntry = ref<ShiftBlocker>();

function openEditModal(entry: ShiftBlocker) {
  editingId.value = entry.id;
  editingEntry.value = {
    startDate: toIsoDateString(entry.startDate),
    startTime: entry.startTime,
    endDate: toIsoDateString(entry.endDate),
    endTime: entry.endTime,
    description: entry.description,
  };
  showEditModal.value = true;
}

async function handleCreate(data: ShiftBlockerFormData) {
  await $fetch('/api/shift-blockers', {
    method: 'POST',
    body: {
      startDate: data.startDate,
      startTime: data.startTime,
      endDate: data.endDate,
      endTime: data.endTime,
      description: data.description,
    },
  });

  await refreshShiftBlockers();
  showCreateModal.value = false;
}

async function handleEdit(data: ShiftBlockerFormData) {
  if (!editingId.value) return;

  await $fetch(`/api/shift-blockers/${editingId.value}`, {
    method: 'PATCH',
    body: {
      startDate: data.startDate,
      startTime: data.startTime,
      endDate: data.endDate,
      endTime: data.endTime,
      description: data.description,
    },
  });

  await refreshShiftBlockers();
  showEditModal.value = false;
  editingEntry.value = undefined;
  editingId.value = undefined;
}

function openDeleteModal(entry: ShiftBlocker) {
  deletingEntry.value = entry;
  showDeleteModal.value = true;
}
</script>

<template>
  <UiPage heading="Schichtblocker" size="xl">
    <UiDataTable
      v-model:global-search="globalSearch"
      :table="table"
      :show-search="true"
    >
      <template #actions>
        <UiModal v-model:open="showCreateModal" title="Schichtblocker hinzufügen">
          <template #trigger>
            <UiIconButton variant="solid" tooltip="Schichtblocker hinzufügen">
              <PlusIcon class="size-6" />
            </UiIconButton>
          </template>
          <ShiftBlockerForm @submit="handleCreate" />
        </UiModal>
      </template>

      <template #toolbar>
        <CalendarHeader v-model="selectedMonth" allow-past-months />
      </template>

      <template #cell="{ cell, row }">
        <template v-if="cell.column.id === 'actions'">
          <div class="flex gap-1">
            <UiIconButton
              tooltip="Schichtblocker bearbeiten"
              @click="openEditModal(row.original)"
            >
              <PencilIcon class="size-5" />
            </UiIconButton>
            <UiIconButton
              color="error"
              tooltip="Schichtblocker löschen"
              @click="openDeleteModal(row.original)"
            >
              <TrashIcon class="size-5" />
            </UiIconButton>
          </div>
        </template>
        <template v-else>
          <FlexRender
            :render="cell.column.columnDef.cell"
            :props="cell.getContext()"
          />
        </template>
      </template>
    </UiDataTable>

    <UiModal v-model:open="showEditModal" title="Schichtblocker bearbeiten">
      <ShiftBlockerForm :initial-data="editingEntry" @submit="handleEdit" />
    </UiModal>

    <ShiftBlockerDeleteModal
      v-model:open="showDeleteModal"
      :shift-blocker="deletingEntry"
      @success="refreshShiftBlockers()"
    />
  </UiPage>
</template>
