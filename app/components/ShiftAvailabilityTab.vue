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
import { Cog6ToothIcon } from '@heroicons/vue/24/outline';
import { useDebounceFn } from '@vueuse/core';
import type { PlannedShift } from '~~/shared/types/planned-shift';
import type {
  AvailabilityStatus,
  ResolvedShiftAvailability,
} from '~~/shared/types/shift-availability';
import type { ResolvedShiftUserPreference } from '~~/shared/types/shift-user-preference';
import type { User } from '~~/shared/types/user';
import { createUserAvatarColumn } from '~/utils/user-table-columns';
import { getUserDisplayName } from '~/utils/user-display';
import {
  formatIsoDate,
  formatTimeRange,
  monthParamFromDate,
  weekdayLabelFromDate,
} from '~/utils/shift-plan';

const selectedMonth = defineModel<Date>('selectedMonth', { required: true });

const props = defineProps<{
  isAdmin: boolean;
}>();

const { user: currentUser } = useUserSession();

const showAllUsers = ref(false);
const showSettings = ref(false);
const showProfileModal = ref(false);
const profileUser = ref<User>();
const savingPreferences = ref(false);
let syncingPreferencesFromServer = false;

function openProfileModal(user: User) {
  profileUser.value = user;
  showProfileModal.value = true;
}

const monthParam = computed(() => monthParamFromDate(selectedMonth.value));

const availabilityQuery = computed(() => ({
  month: monthParam.value,
  ...(props.isAdmin && showAllUsers.value ? { allUsers: 'true' } : {}),
}));

const { data: plannedShifts } = await useFetch<PlannedShift[]>(
  '/api/planned-shifts',
  { query: { month: monthParam } },
);

const { data: availabilities, refresh: refreshAvailabilities } = await useFetch<
  ResolvedShiftAvailability[]
>('/api/shift-availabilities', { query: availabilityQuery });

const { data: preferences, refresh: refreshPreferences } =
  await useFetch<ResolvedShiftUserPreference>('/api/shift-user-preferences');

const { data: backendUsers } = await useFetch<User[]>('/api/users');

const maxShiftsPerMonth = ref('2');
const shiftsOnConsecutiveDays = ref(false);
const shiftsInConsecutiveWeeks = ref(false);

watch(
  preferences,
  (prefs) => {
    if (!prefs) return;
    syncingPreferencesFromServer = true;
    maxShiftsPerMonth.value = String(prefs.maxShiftsPerMonth);
    shiftsOnConsecutiveDays.value = prefs.shiftsOnConsecutiveDays;
    shiftsInConsecutiveWeeks.value = prefs.shiftsInConsecutiveWeeks;
    nextTick(() => {
      syncingPreferencesFromServer = false;
    });
  },
  { immediate: true },
);

async function savePreferences() {
  const max = Number(maxShiftsPerMonth.value);
  if (!Number.isInteger(max) || max < 1) return;

  savingPreferences.value = true;
  try {
    await $fetch('/api/shift-user-preferences', {
      method: 'PUT',
      body: {
        maxShiftsPerMonth: max,
        shiftsOnConsecutiveDays: shiftsOnConsecutiveDays.value,
        shiftsInConsecutiveWeeks: shiftsInConsecutiveWeeks.value,
      },
    });
    await refreshPreferences();
  } finally {
    savingPreferences.value = false;
  }
}

const savePreferencesDebounced = useDebounceFn(() => {
  if (syncingPreferencesFromServer) return;
  void savePreferences();
}, 300);

watch(maxShiftsPerMonth, () => {
  if (syncingPreferencesFromServer) return;
  savePreferencesDebounced();
});

watch([shiftsOnConsecutiveDays, shiftsInConsecutiveWeeks], () => {
  if (syncingPreferencesFromServer) return;
  void savePreferences();
});

const userMap = computed(
  () => new Map((backendUsers.value ?? []).map((u) => [u.id, u])),
);

const statusOptions = [
  { value: 'available', label: 'Verfügbar' },
  { value: 'preference', label: 'Präferenz' },
  { value: 'unavailable', label: 'Nicht verfügbar' },
];

type AvailabilityRow = {
  id: string;
  plannedShiftId: string;
  userId: string;
  date: Date | string;
  comment: string | null;
  startTime: string;
  endTime: string;
  plusOneDay: boolean;
  status: AvailabilityStatus;
};

const rows = computed<AvailabilityRow[]>(() => {
  const shiftById = new Map(
    (plannedShifts.value ?? []).map((shift) => [shift.id, shift]),
  );

  return (availabilities.value ?? []).map((availability) => {
    const shift = shiftById.get(availability.plannedShiftId);
    return {
      id: `${availability.userId}-${availability.plannedShiftId}`,
      plannedShiftId: availability.plannedShiftId,
      userId: availability.userId,
      date: shift?.date ?? '',
      comment: shift?.comment ?? null,
      startTime: shift?.startTime ?? '',
      endTime: shift?.endTime ?? '',
      plusOneDay: shift?.plusOneDay ?? false,
      status: availability.status,
    };
  });
});

const sorting = ref<SortingState>([{ id: 'date', desc: false }]);
const globalSearch = ref('');
const savingIds = ref(new Set<string>());

const columnHelper = createColumnHelper<AvailabilityRow>();
const avatarColumn = createUserAvatarColumn(columnHelper);

const columns = computed(() => {
  const cols = [
    columnHelper.accessor('date', {
      header: 'Datum',
      cell: (info) => (info.getValue() ? formatIsoDate(info.getValue()) : '—'),
    }),
    columnHelper.accessor(
      (row) => (row.date ? weekdayLabelFromDate(row.date) : ''),
      {
        id: 'weekday',
        header: 'Tag',
        cell: (info) => info.getValue() || '—',
      },
    ),
    columnHelper.display({
      id: 'status',
      header: 'Verfügbarkeit',
    }),
    columnHelper.display({
      id: 'time',
      header: 'Zeit',
      cell: (info) =>
        info.row.original.startTime
          ? formatTimeRange(
              info.row.original.startTime,
              info.row.original.endTime,
              info.row.original.plusOneDay,
            )
          : '—',
    }),
    columnHelper.accessor('comment', {
      header: 'Kommentar',
      cell: (info) => info.getValue() || '—',
    }),
  ];

  if (props.isAdmin && showAllUsers.value) {
    return [
      avatarColumn,
      columnHelper.accessor('userId', {
        header: 'Genoss*in',
        cell: (info) => {
          const user = userMap.value.get(info.getValue());
          return user ? getUserDisplayName(user) : info.getValue();
        },
      }),
      ...cols,
    ];
  }

  return cols;
});

const table = useVueTable({
  get data() {
    return rows.value;
  },
  get columns() {
    return columns.value;
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
    const r = row.original;
    const user = userMap.value.get(r.userId);
    return [
      r.date ? formatIsoDate(r.date) : '',
      r.date ? weekdayLabelFromDate(r.date) : '',
      r.startTime ? formatTimeRange(r.startTime, r.endTime, r.plusOneDay) : '',
      r.comment ?? '',
      user ? getUserDisplayName(user) : '',
      r.status,
    ].some((v) => v.toLowerCase().includes(search));
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

function canEditRow(row: AvailabilityRow) {
  return row.userId === currentUser.value?.id;
}

async function setStatus(row: AvailabilityRow, status: string | undefined) {
  if (!status || !canEditRow(row)) return;
  savingIds.value = new Set([...savingIds.value, row.plannedShiftId]);
  try {
    await $fetch('/api/shift-availabilities', {
      method: 'PUT',
      body: {
        plannedShiftId: row.plannedShiftId,
        status: status as AvailabilityStatus,
      },
    });
    await refreshAvailabilities();
  } finally {
    const next = new Set(savingIds.value);
    next.delete(row.plannedShiftId);
    savingIds.value = next;
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <UiDataTable
      v-model:global-search="globalSearch"
      :table="table"
      :show-search="true"
    >
      <template #actions>
        <UiModal v-model:open="showSettings" title="Einstellungen">
          <template #trigger>
            <UiIconButton variant="solid" tooltip="Einstellungen">
              <Cog6ToothIcon class="size-6" />
            </UiIconButton>
          </template>
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4">
              <fieldset
                :disabled="savingPreferences"
                class="flex flex-col gap-4 border-0 p-0"
              >
                <UiInputField
                  id="pref-max-shifts"
                  v-model="maxShiftsPerMonth"
                  label="Max. Schichten pro Monat"
                  type="number"
                />
                <UiCheckbox
                  id="pref-consecutive-days"
                  v-model="shiftsOnConsecutiveDays"
                  label="Schichten an aufeinanderfolgenden Tagen"
                  :disabled="savingPreferences"
                />
                <UiCheckbox
                  id="pref-consecutive-weeks"
                  v-model="shiftsInConsecutiveWeeks"
                  label="Schichten in aufeinanderfolgenden Wochen"
                  :disabled="savingPreferences"
                />
              </fieldset>
            </div>
            <div v-if="isAdmin" class="flex flex-col gap-4">
              <span class="text-lg font-semibold">Anzeige</span>
              <UiCheckbox
                id="avail-all-users"
                v-model="showAllUsers"
                label="Alle Genoss*innen anzeigen"
              />
            </div>
          </div>
        </UiModal>
      </template>

      <template #toolbar>
        <CalendarHeader v-model="selectedMonth" allow-past-months />
      </template>

      <template #cell="{ cell, row }">
        <template v-if="cell.column.id === 'avatar'">
          <UserCell
            part="avatar"
            :user="userMap.get(row.original.userId)"
            @profile="openProfileModal"
          />
        </template>
        <template v-else-if="cell.column.id === 'status'">
          <UiRadioGroup
            :model-value="row.original.status"
            :name="`avail-${row.original.id}`"
            :options="statusOptions"
            :disabled="
              !canEditRow(row.original) ||
              savingIds.has(row.original.plannedShiftId)
            "
            @update:model-value="setStatus(row.original, $event)"
          />
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

    <UserProfileModal v-model:open="showProfileModal" :user="profileUser" />
  </div>
</template>
