<script setup lang="ts">
import {
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useVueTable,
  type SortingState,
} from '@tanstack/vue-table';
import {
  ArrowDownTrayIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import type { ShiftTemplate } from '~~/shared/types/shift-template';
import type { PlannedShift } from '~~/shared/types/planned-shift';
import type { ShiftTemplateFormData } from '~/components/ShiftTemplateForm.vue';
import type { PlannedShiftFormData } from '~/components/PlannedShiftForm.vue';
import {
  WEEKDAY_LABELS,
  formatIsoDate,
  formatTimeRange,
  monthParamFromDate,
  toIsoDateString,
} from '~/utils/shift-plan';

const selectedMonth = defineModel<Date>('selectedMonth', { required: true });

const props = defineProps<{
  isAdmin: boolean;
}>();

const monthParam = computed(() => monthParamFromDate(selectedMonth.value));

const { data: templates, refresh: refreshTemplates } = await useFetch<
  ShiftTemplate[]
>('/api/shift-templates');

const { data: plannedShifts, refresh: refreshPlannedShifts } = await useFetch<
  PlannedShift[]
>('/api/planned-shifts', { query: { month: monthParam } });

const templateSorting = ref<SortingState>([{ id: 'weekday', desc: false }]);
const templateSearch = ref('');
const shiftSorting = ref<SortingState>([{ id: 'date', desc: false }]);
const shiftSearch = ref('');

const templateColumnHelper = createColumnHelper<ShiftTemplate>();

const templateColumns = computed(() => {
  const cols = [
    templateColumnHelper.accessor('label', {
      header: 'Bezeichnung',
      cell: (info) => info.getValue() || '—',
    }),
    templateColumnHelper.accessor('weekday', {
      header: 'Tag',
      cell: (info) => WEEKDAY_LABELS[info.getValue()] ?? info.getValue(),
    }),
    templateColumnHelper.display({
      id: 'time',
      header: 'Zeit',
      cell: (info) =>
        formatTimeRange(
          info.row.original.startTime,
          info.row.original.endTime,
          info.row.original.plusOneDay,
        ),
    }),
    templateColumnHelper.accessor('numberOfPersons', {
      header: 'Personen',
    }),
  ];
  if (props.isAdmin) {
    cols.push(
      templateColumnHelper.display({
        id: 'actions',
        header: 'Aktionen',
      }),
    );
  }
  return cols;
});

const templateTable = useVueTable({
  get data() {
    return templates.value ?? [];
  },
  get columns() {
    return templateColumns.value;
  },
  state: {
    get sorting() {
      return templateSorting.value;
    },
    get globalFilter() {
      return templateSearch.value;
    },
  },
  onSortingChange: (updater) => {
    templateSorting.value =
      typeof updater === 'function' ? updater(templateSorting.value) : updater;
  },
  globalFilterFn: (row, _columnId, filterValue: string) => {
    const search = filterValue.toLowerCase();
    const t = row.original;
    return [
      t.label,
      WEEKDAY_LABELS[t.weekday] ?? '',
      formatTimeRange(t.startTime, t.endTime, t.plusOneDay),
      String(t.numberOfPersons),
    ].some((v) => v.toLowerCase().includes(search));
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

const shiftColumnHelper = createColumnHelper<PlannedShift>();

const shiftColumns = computed(() => {
  const cols = [
    shiftColumnHelper.accessor('date', {
      header: 'Datum',
      cell: (info) => formatIsoDate(info.getValue()),
    }),
    shiftColumnHelper.accessor('label', {
      header: 'Bezeichnung',
      cell: (info) => info.getValue() || '—',
    }),
    shiftColumnHelper.display({
      id: 'time',
      header: 'Zeit',
      cell: (info) =>
        formatTimeRange(
          info.row.original.startTime,
          info.row.original.endTime,
          info.row.original.plusOneDay,
        ),
    }),
    shiftColumnHelper.accessor('numberOfPersons', {
      header: 'Personen',
    }),
  ];
  if (props.isAdmin) {
    cols.push(
      shiftColumnHelper.display({
        id: 'actions',
        header: 'Aktionen',
      }),
    );
  }
  return cols;
});

const shiftTable = useVueTable({
  get data() {
    return plannedShifts.value ?? [];
  },
  get columns() {
    return shiftColumns.value;
  },
  state: {
    get sorting() {
      return shiftSorting.value;
    },
    get globalFilter() {
      return shiftSearch.value;
    },
  },
  onSortingChange: (updater) => {
    shiftSorting.value =
      typeof updater === 'function' ? updater(shiftSorting.value) : updater;
  },
  globalFilterFn: (row, _columnId, filterValue: string) => {
    const search = filterValue.toLowerCase();
    const s = row.original;
    return [
      formatIsoDate(s.date),
      s.label,
      formatTimeRange(s.startTime, s.endTime, s.plusOneDay),
      String(s.numberOfPersons),
    ].some((v) => v.toLowerCase().includes(search));
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

const showCreateTemplate = ref(false);
const showEditTemplate = ref(false);
const editingTemplateId = ref<string>();
const editingTemplate = ref<ShiftTemplateFormData>();
const deletingTemplate = ref<ShiftTemplate>();
const showDeleteTemplate = ref(false);
const deletingTemplateLoading = ref(false);

const showCreateShift = ref(false);
const deletingShift = ref<PlannedShift>();
const showDeleteShift = ref(false);
const deletingShiftLoading = ref(false);
const importing = ref(false);

function openEditTemplate(t: ShiftTemplate) {
  editingTemplateId.value = t.id;
  editingTemplate.value = {
    label: t.label,
    weekday: t.weekday,
    startTime: t.startTime.slice(0, 5),
    endTime: t.endTime.slice(0, 5),
    plusOneDay: t.plusOneDay,
    numberOfPersons: t.numberOfPersons,
  };
  showEditTemplate.value = true;
}

async function handleCreateTemplate(data: ShiftTemplateFormData) {
  await $fetch('/api/shift-templates', { method: 'POST', body: data });
  await refreshTemplates();
  showCreateTemplate.value = false;
}

async function handleEditTemplate(data: ShiftTemplateFormData) {
  if (!editingTemplateId.value) return;
  await $fetch(`/api/shift-templates/${editingTemplateId.value}`, {
    method: 'PATCH',
    body: data,
  });
  await refreshTemplates();
  showEditTemplate.value = false;
  editingTemplateId.value = undefined;
  editingTemplate.value = undefined;
}

async function confirmDeleteTemplate() {
  if (!deletingTemplate.value) return;
  deletingTemplateLoading.value = true;
  try {
    await $fetch(`/api/shift-templates/${deletingTemplate.value.id}`, {
      method: 'DELETE',
    });
    await refreshTemplates();
    showDeleteTemplate.value = false;
    deletingTemplate.value = undefined;
  } finally {
    deletingTemplateLoading.value = false;
  }
}

async function handleCreateShift(data: PlannedShiftFormData) {
  await $fetch('/api/planned-shifts', { method: 'POST', body: data });
  await refreshPlannedShifts();
  showCreateShift.value = false;
}

async function confirmDeleteShift() {
  if (!deletingShift.value) return;
  deletingShiftLoading.value = true;
  try {
    await $fetch(`/api/planned-shifts/${deletingShift.value.id}`, {
      method: 'DELETE',
    });
    await refreshPlannedShifts();
    showDeleteShift.value = false;
    deletingShift.value = undefined;
  } finally {
    deletingShiftLoading.value = false;
  }
}

async function importTemplates() {
  importing.value = true;
  try {
    await $fetch('/api/planned-shifts/import', {
      method: 'POST',
      body: { month: monthParam.value },
    });
    await refreshPlannedShifts();
  } finally {
    importing.value = false;
  }
}

const defaultShiftDate = computed(() => {
  const d = selectedMonth.value;
  const today = new Date();
  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth()
  ) {
    return toIsoDateString(today);
  }
  return toIsoDateString(d);
});
</script>

<template>
  <div class="flex flex-col gap-10">
    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-semibold">Vorlagen</h2>
      <UiDataTable
        v-model:global-search="templateSearch"
        :table="templateTable"
        :show-search="true"
      >
        <template v-if="isAdmin" #actions>
          <UiModal v-model:open="showCreateTemplate" title="Vorlage erstellen">
            <template #trigger>
              <UiIconButton variant="solid" tooltip="Vorlage erstellen">
                <PlusIcon class="size-6" />
              </UiIconButton>
            </template>
            <ShiftTemplateForm @submit="handleCreateTemplate" />
          </UiModal>
        </template>
        <template #cell="{ cell, row }">
          <template v-if="cell.column.id === 'actions'">
            <div class="flex gap-1">
              <UiIconButton
                aria-label="Bearbeiten"
                @click="openEditTemplate(row.original)"
              >
                <PencilIcon class="size-4" />
              </UiIconButton>
              <UiIconButton
                aria-label="Löschen"
                @click="
                  deletingTemplate = row.original;
                  showDeleteTemplate = true;
                "
              >
                <TrashIcon class="size-4" />
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
        <template #empty>Keine Vorlagen vorhanden.</template>
      </UiDataTable>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-semibold">Schichten im Monat</h2>
      <UiDataTable
        v-model:global-search="shiftSearch"
        :table="shiftTable"
        :show-search="true"
      >
        <template v-if="isAdmin" #actions>
          <div class="flex flex-wrap gap-2">
            <UiIconButton
              variant="solid"
              tooltip="Vorlagen importieren"
              :disabled="importing"
              @click="importTemplates"
            >
              <ArrowDownTrayIcon class="size-6" />
            </UiIconButton>
            <UiModal v-model:open="showCreateShift" title="Schicht hinzufügen">
              <template #trigger>
                <UiIconButton variant="solid" tooltip="Schicht hinzufügen">
                  <PlusIcon class="size-6" />
                </UiIconButton>
              </template>
              <PlannedShiftForm
                :default-date="defaultShiftDate"
                @submit="handleCreateShift"
              />
            </UiModal>
          </div>
        </template>

        <template #toolbar>
          <CalendarHeader v-model="selectedMonth" allow-past-months />
        </template>

        <template #cell="{ cell, row }">
          <template v-if="cell.column.id === 'actions'">
            <UiIconButton
              aria-label="Löschen"
              @click="
                deletingShift = row.original;
                showDeleteShift = true;
              "
            >
              <TrashIcon class="size-4" />
            </UiIconButton>
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
    </section>

    <UiModal v-model:open="showEditTemplate" title="Vorlage bearbeiten">
      <ShiftTemplateForm
        v-if="editingTemplate"
        :initial-data="editingTemplate"
        @submit="handleEditTemplate"
      />
    </UiModal>

    <UiConfirmDeleteModal
      v-model:open="showDeleteTemplate"
      title="Vorlage löschen"
      :description="`Vorlage „${deletingTemplate?.label || WEEKDAY_LABELS[deletingTemplate?.weekday ?? 1]}“ wirklich löschen?`"
      :loading="deletingTemplateLoading"
      @confirm="confirmDeleteTemplate"
    />

    <UiConfirmDeleteModal
      v-model:open="showDeleteShift"
      title="Schicht löschen"
      :description="`Schicht am ${deletingShift ? formatIsoDate(deletingShift.date) : ''} wirklich löschen?`"
      :loading="deletingShiftLoading"
      @confirm="confirmDeleteShift"
    />
  </div>
</template>
