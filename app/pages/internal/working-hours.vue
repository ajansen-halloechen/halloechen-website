<script setup lang="ts">
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { WorkingHour } from '~~/shared/types/working-hour';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const today = new Date();
const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const selectedMonth = ref(new Date(currentMonthStart));

const users: Record<number, string> = {
  1: 'Anna Müller',
  2: 'Ben Schmidt',
  3: 'Clara Weber',
};

const workingHours = ref<WorkingHour[]>([
  {
    id: 1,
    userId: 1,
    date: '2026-05-12',
    startTime: '08:00',
    endTime: '16:30',
    breakInHours: 0.5,
    plusOneDay: false,
    activity: 'Barschicht',
    createdAt: '2026-05-12T08:00:00Z',
    updatedAt: '2026-05-12T16:30:00Z',
  },
  {
    id: 2,
    userId: 2,
    date: '2026-05-12',
    startTime: '09:00',
    endTime: '17:00',
    breakInHours: 1,
    plusOneDay: false,
    activity: 'Klo putzen',
    createdAt: '2026-05-12T09:00:00Z',
    updatedAt: '2026-05-12T17:00:00Z',
  },
  {
    id: 3,
    userId: 3,
    date: '2026-05-13',
    startTime: '22:00',
    endTime: '06:00',
    breakInHours: 0.5,
    plusOneDay: true,
    activity: 'Rechnungen',
    createdAt: '2026-05-13T22:00:00Z',
    updatedAt: '2026-05-14T06:00:00Z',
  },
  {
    id: 4,
    userId: 1,
    date: '2026-05-13',
    startTime: '07:30',
    endTime: '15:30',
    breakInHours: 0.5,
    plusOneDay: false,
    activity: 'Barschicht',
    createdAt: '2026-05-13T07:30:00Z',
    updatedAt: '2026-05-13T15:30:00Z',
  },
  {
    id: 5,
    userId: 2,
    date: '2026-05-14',
    startTime: '10:00',
    endTime: '18:00',
    breakInHours: 0.5,
    plusOneDay: false,
    activity: 'Barschicht',
    createdAt: '2026-05-14T10:00:00Z',
    updatedAt: '2026-05-14T18:00:00Z',
  },
  {
    id: 6,
    userId: 3,
    date: '2026-05-14',
    startTime: '08:00',
    endTime: '12:00',
    breakInHours: 0,
    plusOneDay: false,
    activity: 'Klo putzen',
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-14T12:00:00Z',
  },
  {
    id: 7,
    userId: 1,
    date: '2026-05-14',
    startTime: '18:00',
    endTime: '02:00',
    breakInHours: 0.5,
    plusOneDay: true,
    activity: 'Barschicht',
    createdAt: '2026-05-14T18:00:00Z',
    updatedAt: '2026-05-15T02:00:00Z',
  },
  {
    id: 8,
    userId: 2,
    date: '2026-05-15',
    startTime: '07:00',
    endTime: '13:00',
    breakInHours: 0.5,
    plusOneDay: false,
    activity: 'Rechnungen',
    createdAt: '2026-05-15T07:00:00Z',
    updatedAt: '2026-05-15T13:00:00Z',
  },
  {
    id: 9,
    userId: 3,
    date: '2026-05-15',
    startTime: '14:00',
    endTime: '22:00',
    breakInHours: 1,
    plusOneDay: false,
    activity: 'Barschicht',
    createdAt: '2026-05-15T14:00:00Z',
    updatedAt: '2026-05-15T22:00:00Z',
  },
  {
    id: 10,
    userId: 1,
    date: '2026-05-15',
    startTime: '09:00',
    endTime: '15:00',
    breakInHours: 0.5,
    plusOneDay: false,
    activity: 'Klo putzen',
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-05-15T15:00:00Z',
  },
  {
    id: 11,
    userId: 3,
    date: '2026-05-14',
    startTime: '08:00',
    endTime: '12:00',
    breakInHours: 0,
    plusOneDay: false,
    activity: 'Klo putzen',
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-14T12:00:00Z',
  },
  {
    id: 12,
    userId: 1,
    date: '2026-05-14',
    startTime: '18:00',
    endTime: '02:00',
    breakInHours: 0.5,
    plusOneDay: true,
    activity: 'Barschicht',
    createdAt: '2026-05-14T18:00:00Z',
    updatedAt: '2026-05-15T02:00:00Z',
  },
  {
    id: 13,
    userId: 2,
    date: '2026-05-15',
    startTime: '07:00',
    endTime: '13:00',
    breakInHours: 0.5,
    plusOneDay: false,
    activity: 'Rechnungen',
    createdAt: '2026-05-15T07:00:00Z',
    updatedAt: '2026-05-15T13:00:00Z',
  },
  {
    id: 14,
    userId: 3,
    date: '2026-05-15',
    startTime: '14:00',
    endTime: '22:00',
    breakInHours: 1,
    plusOneDay: false,
    activity: 'Barschicht',
    createdAt: '2026-05-15T14:00:00Z',
    updatedAt: '2026-05-15T22:00:00Z',
  },
  {
    id: 15,
    userId: 1,
    date: '2026-05-15',
    startTime: '09:00',
    endTime: '15:00',
    breakInHours: 0.5,
    plusOneDay: false,
    activity: 'Klo putzen',
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-05-15T15:00:00Z',
  },
]);

function computeHours(row: WorkingHour): number {
  const [sh = 0, sm = 0] = row.startTime.split(':').map(Number);
  const [eh = 0, em = 0] = row.endTime.split(':').map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (row.plusOneDay) diff += 24 * 60;
  return Math.max(0, (diff / 60) - row.breakInHours);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const columnHelper = createColumnHelper<WorkingHour>();

const columns = [
  columnHelper.accessor('userId', {
    header: 'Genoss*in',
    cell: (info) => users[info.getValue()] ?? `User ${info.getValue()}`,
  }),
  columnHelper.accessor('date', {
    header: 'Datum',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('activity', {
    header: 'Aktivität',
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
    return workingHours.value;
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
  <div class="flex flex-col w-full max-w-7xl mx-auto px-8">
    <h1 class="text-center text-2xl md:text-3xl font-bold py-8">Zeiterfassung</h1>
    <div class="flex justify-end mb-4">
      <UiIconButton variant="solid" aria-label="Arbeitszeit hinzufügen">
        <PlusIcon class="size-6" />
      </UiIconButton>
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
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                :props="header.getContext()" />
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-primary/10">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id"
              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700" :class="{
                'text-right': (cell.column.columnDef.meta as any)?.align === 'right',
                'w-0': (cell.column.columnDef.meta as any)?.shrink,
              }">
              <template v-if="cell.column.id === 'actions'">
                <div class="flex gap-1">
                  <UiIconButton aria-label="Bearbeiten">
                    <PencilIcon class="size-5" />
                  </UiIconButton>
                  <UiIconButton aria-label="Löschen">
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
  </div>
</template>
