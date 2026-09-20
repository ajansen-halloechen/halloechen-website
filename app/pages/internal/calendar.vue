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
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type {
  CalendarEntry,
  CalendarEntryType,
} from '~~/shared/types/calendar-entry';
import type { CalendarEntryFormData } from '~/components/CalendarEntryForm.vue';
import { calendarEntryTypeLabels } from '~/utils/calendar-entry';
import { monthStartFromIsoDate } from '~/utils/month';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { highlightedRowId, highlightRow } = useTableRowHighlight();

const today = new Date();
const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const selectedMonth = ref(new Date(currentMonthStart));

const monthParam = computed(() => {
  const d = selectedMonth.value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
});

const { data: calendarEntries, refresh: refreshCalendarEntries } =
  await useFetch<CalendarEntry[]>('/api/calendar-entries', {
    query: { month: monthParam },
  });

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function toIsoDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateTime(date: Date | string, time: string): string {
  return `${formatDate(date)} ${formatTime(time)}`;
}

const sorting = ref<SortingState>([{ id: 'startDate', desc: false }]);
const columnFilters = ref<ColumnFiltersState>([]);
const globalSearch = ref('');

const allTypes: CalendarEntryType[] = [
  'publicEvent',
  'internalEvent',
  'reservation',
];
const selectedTypes = ref<string[]>([...allTypes]);

const typeFilterOptions = computed(() =>
  allTypes.map((value) => ({
    value,
    label: calendarEntryTypeLabels[value],
  })),
);

watch(selectedTypes, () => {
  const filters: ColumnFiltersState = [];
  if (selectedTypes.value.length < allTypes.length) {
    filters.push({ id: 'type', value: [...selectedTypes.value] });
  }
  columnFilters.value = filters;
});

const columnHelper = createColumnHelper<CalendarEntry>();

const columns = [
  columnHelper.accessor('title', {
    header: 'Titel',
    enableSorting: true,
  }),
  columnHelper.accessor('type', {
    header: 'Typ',
    filterFn: (row, _columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue('type')),
    enableSorting: false,
  }),
  columnHelper.accessor('startDate', {
    header: 'Beginn',
    cell: (info) =>
      formatDateTime(info.getValue(), info.row.original.startTime),
    enableSorting: true,
    enableGlobalFilter: false,
  }),
  columnHelper.display({
    id: 'end',
    header: 'Ende',
    cell: (info) =>
      formatDateTime(info.row.original.endDate, info.row.original.endTime),
  }),
  columnHelper.accessor('description', {
    header: 'Beschreibung',
    cell: (info) => {
      const value = info.getValue();
      if (!value) return '—';
      return value.length > 60 ? `${value.slice(0, 60)}…` : value;
    },
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Aktionen',
  }),
];

const table = useVueTable({
  get data() {
    return calendarEntries.value ?? [];
  },
  get columns() {
    return columns;
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
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
    const entry = row.original;
    const typeLabel = calendarEntryTypeLabels[entry.type];
    const start = formatDateTime(entry.startDate, entry.startTime);
    const end = formatDateTime(entry.endDate, entry.endTime);
    return [typeLabel, entry.title, entry.description, start, end].some((v) =>
      v.toLowerCase().includes(search),
    );
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showSubscribeModal = ref(false);
const editingId = ref<string | undefined>();
const editingEntry = ref<CalendarEntryFormData>();
const deletingEntry = ref<CalendarEntry>();

function openEditModal(entry: CalendarEntry) {
  editingId.value = entry.id;
  editingEntry.value = {
    title: entry.title,
    description: entry.description,
    startDate: toIsoDateString(entry.startDate),
    startTime: entry.startTime.slice(0, 5),
    endDate: toIsoDateString(entry.endDate),
    endTime: entry.endTime.slice(0, 5),
    type: entry.type,
  };
  showEditModal.value = true;
}

async function revealSavedEntry(entry: CalendarEntry) {
  selectedMonth.value = monthStartFromIsoDate(entry.startDate);
  await refreshCalendarEntries();
  highlightRow(entry.id);
}

async function handleCreate(data: CalendarEntryFormData) {
  const entry = await $fetch<CalendarEntry>('/api/calendar-entries', {
    method: 'POST',
    body: data,
  });

  showCreateModal.value = false;
  await revealSavedEntry(entry);
}

async function handleEdit(data: CalendarEntryFormData) {
  if (!editingId.value) return;

  const entry = await $fetch<CalendarEntry>(
    `/api/calendar-entries/${editingId.value}`,
    {
      method: 'PATCH',
      body: data,
    },
  );

  showEditModal.value = false;
  editingEntry.value = undefined;
  editingId.value = undefined;
  await revealSavedEntry(entry);
}

function openDeleteModal(entry: CalendarEntry) {
  deletingEntry.value = entry;
  showDeleteModal.value = true;
}
</script>

<template>
  <UiPage heading="Kalender" size="xl">
    <UiDataTable
      v-model:global-search="globalSearch"
      :table="table"
      :show-search="true"
      :highlighted-row-id="highlightedRowId"
    >
      <template #actions>
        <div class="flex items-center gap-1">
          <CalendarSubscribeModal v-model:open="showSubscribeModal" />
          <UiModal v-model:open="showCreateModal" title="Eintrag hinzufügen">
            <template #trigger>
              <UiIconButton variant="solid" tooltip="Eintrag hinzufügen">
                <PlusIcon class="size-6" />
              </UiIconButton>
            </template>
            <CalendarEntryForm @submit="handleCreate" />
          </UiModal>
        </div>
      </template>

      <template #toolbar>
        <CalendarHeader v-model="selectedMonth" allow-past-months />
      </template>

      <template #column-filter="{ column }">
        <UiFilterPopover
          v-if="column.id === 'type'"
          v-model="selectedTypes"
          :options="typeFilterOptions"
          aria-label="Nach Typ filtern"
        />
      </template>

      <template #cell="{ cell, row }">
        <template v-if="cell.column.id === 'actions'">
          <div class="flex gap-1">
            <UiIconButton
              tooltip="Eintrag bearbeiten"
              @click="openEditModal(row.original)"
            >
              <PencilIcon class="size-5" />
            </UiIconButton>
            <UiIconButton
              color="error"
              tooltip="Eintrag löschen"
              @click="openDeleteModal(row.original)"
            >
              <TrashIcon class="size-5" />
            </UiIconButton>
          </div>
        </template>
        <template v-else-if="cell.column.id === 'type'">
          <CalendarEntryTypeBadge :type="row.original.type" />
        </template>
        <template v-else>
          <FlexRender
            :render="cell.column.columnDef.cell"
            :props="cell.getContext()"
          />
        </template>
      </template>
    </UiDataTable>

    <UiModal v-model:open="showEditModal" title="Eintrag bearbeiten">
      <CalendarEntryForm :initial-data="editingEntry" @submit="handleEdit" />
    </UiModal>

    <CalendarEntryDeleteModal
      v-model:open="showDeleteModal"
      :entry="deletingEntry"
      @success="refreshCalendarEntries()"
    />
  </UiPage>
</template>
