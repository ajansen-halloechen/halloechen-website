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
import type { User } from '~~/shared/types/user';
import { addDays } from '~~/shared/time-range-validation';
import type { CalendarEntryFormData } from '~/components/CalendarEntryForm.vue';
import { calendarEntryTypeLabels } from '~/utils/calendar-entry';
import { monthStartFromIsoDate } from '~/utils/month';
import {
  formatIsoDate,
  formatTimeRange,
  weekdayLabelFromDate,
} from '~/utils/shift-plan';
import { getUserDisplayName } from '~/utils/user-display';

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

const { data: backendUsers } = await useFetch<User[]>('/api/users');
const { data: calendarEntries, refresh: refreshCalendarEntries } =
  await useFetch<CalendarEntry[]>('/api/calendar-entries', {
    query: { month: monthParam },
  });

const userMap = computed(
  () => new Map((backendUsers.value ?? []).map((u) => [u.id, u])),
);

function toIsoDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatEntryTime(entry: CalendarEntry): string {
  const startIso = toIsoDateString(entry.startDate);
  const endIso = toIsoDateString(entry.endDate);
  const plusOneDay = endIso === addDays(startIso, 1);
  return formatTimeRange(entry.startTime, entry.endTime, plusOneDay);
}

function getCreatorName(userId: string): string {
  const user = userMap.value.get(userId);
  return user ? getUserDisplayName(user) : userId;
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
  columnHelper.accessor('startDate', {
    header: 'Datum',
    cell: (info) => formatIsoDate(info.getValue()),
    enableSorting: true,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor((row) => weekdayLabelFromDate(row.startDate), {
    id: 'weekday',
    header: 'Tag',
  }),
  columnHelper.display({
    id: 'time',
    header: 'Zeit',
    cell: (info) => formatEntryTime(info.row.original),
  }),
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
  columnHelper.accessor('createdByUserId', {
    header: 'Erstellt von',
    cell: (info) => getCreatorName(info.getValue()),
    enableSorting: false,
  }),
  columnHelper.accessor('comment', {
    header: 'Kommentar',
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
    return [
      typeLabel,
      entry.title,
      entry.comment,
      formatIsoDate(entry.startDate),
      weekdayLabelFromDate(entry.startDate),
      formatEntryTime(entry),
      getCreatorName(entry.createdByUserId),
    ].some((v) => v.toLowerCase().includes(search));
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
    comment: entry.comment,
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
