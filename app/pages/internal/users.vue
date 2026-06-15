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
  TrashIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,
} from '@heroicons/vue/24/outline';
import { UserRole, type User } from '~~/shared/types/user';

const { success, warning, error } = useToast();

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { user: currentUser } = useUserSession();

const { data: users, refresh: refreshUsers } =
  await useFetch<User[]>('/api/users');

const sorting = ref<SortingState>([{ id: 'displayName', desc: false }]);
const columnFilters = ref<ColumnFiltersState>([]);
const globalSearch = ref('');

const uniqueStatuses = ['Aktiv', 'Eingeladen'] as const;

const selectedStatuses = ref<string[]>([...uniqueStatuses]);

const statusFilterOptions = computed(() =>
  uniqueStatuses.map((status) => ({
    value: status,
    label: status,
  })),
);

watch([selectedStatuses], () => {
  const filters: ColumnFiltersState = [];
  if (selectedStatuses.value.length < uniqueStatuses.length) {
    filters.push({ id: 'status', value: [...selectedStatuses.value] });
  }
  columnFilters.value = filters;
});

const showCreateModal = ref(false);
const showRoleModal = ref(false);
const editingUser = ref<User>();

const newEmail = ref('');
const newRole = ref<'user' | 'admin'>('user');
const editRole = ref<'user' | 'admin'>('user');
const resendLoadingId = ref<string | null>(null);

const isAdmin = computed(() => currentUser.value?.role === UserRole.admin);

function getUserDisplayName(user: User): string | null {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return null;
}

function getUserSortKey(user: User): string {
  return getUserDisplayName(user) ?? user.email;
}

function getUserStatus(user: User): string {
  return user.isPending ? 'Eingeladen' : 'Aktiv';
}

const columnHelper = createColumnHelper<User>();

const baseColumns = [
  columnHelper.accessor((row) => getUserSortKey(row), {
    id: 'displayName',
    header: 'Genoss*in',
    cell: (info) => getUserDisplayName(info.row.original) ?? '',
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;
      return a.localeCompare(b, 'de');
    },
  }),
  columnHelper.accessor('email', {
    header: 'E-Mail',
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'phoneNumber',
    header: 'Telefon',
    enableSorting: false,
  }),
  columnHelper.accessor((row) => getUserStatus(row), {
    id: 'status',
    header: 'Status',
    cell: (info) => info.getValue(),
    filterFn: (row, _columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue('status')),
    enableSorting: false,
  }),
];

const adminColumns = [
  ...baseColumns,
  columnHelper.display({
    id: 'actions',
    header: 'Aktionen',
  }),
];

const table = useVueTable({
  get data() {
    return users.value ?? [];
  },
  get columns() {
    return isAdmin.value ? adminColumns : baseColumns;
  },
  getRowId: (row) => row.id,
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
    const u = row.original;
    return [getUserDisplayName(u), u.email, u.phoneNumber, getUserStatus(u)]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search));
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

function openRoleModal(user: User) {
  editingUser.value = user;
  editRole.value = user.role;
  showRoleModal.value = true;
}

async function handleCreate() {
  if (!newEmail.value) return;

  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: { email: newEmail.value, role: newRole.value },
    });
    newEmail.value = '';
    newRole.value = 'user';
    await refreshUsers();
    showCreateModal.value = false;
    success('Einladung wurde versendet.');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 409
    ) {
      error('Diese E-Mail-Adresse ist bereits registriert.');
    } else if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 502
    ) {
      warning(
        'Die Genoss*in wurde angelegt, aber die E-Mail konnte nicht versendet werden. Bitte „Einladung erneut senden“ verwenden.',
      );
      await refreshUsers();
    } else {
      error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
  }
}

async function handleResendInvitation(user: User) {
  resendLoadingId.value = user.id;

  try {
    await $fetch(`/api/users/${user.id}/resend-invitation`, {
      method: 'POST',
    });
    success('Einladung wurde erneut versendet.');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 502
    ) {
      error('Die E-Mail konnte nicht versendet werden.');
    } else {
      error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
  } finally {
    resendLoadingId.value = null;
  }
}

async function handleRoleChange() {
  if (!editingUser.value) return;
  await $fetch(`/api/users/${editingUser.value.id}`, {
    method: 'PATCH',
    body: { role: editRole.value },
  });
  showRoleModal.value = false;
  editingUser.value = undefined;
  await refreshUsers();
}

async function handleDelete(id: string) {
  await $fetch(`/api/users/${id}`, { method: 'DELETE' });
  await refreshUsers();
}
</script>

<template>
  <UiPage heading="Genoss*innen" size="xl">
    <UiDataTable
      v-model:global-search="globalSearch"
      :table="table"
      :show-search="true"
    >
      <template #actions>
        <UiModal
          v-if="isAdmin"
          v-model:open="showCreateModal"
          title="Genoss*in einladen"
        >
          <template #trigger>
            <UiIconButton variant="solid" aria-label="Genoss*in einladen">
              <PlusIcon class="size-6" />
            </UiIconButton>
          </template>
          <form class="flex flex-col gap-4" @submit.prevent="handleCreate">
            <UiInputField
              id="new-email"
              v-model="newEmail"
              label="E-Mail"
              type="email"
              required
            />
            <UiInputField id="new-role" label="Rolle">
              <select
                id="new-role"
                v-model="newRole"
                class="min-w-0 flex-1 bg-transparent outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </UiInputField>
            <UiButton type="submit" class="self-end">Einladen</UiButton>
          </form>
        </UiModal>
      </template>

      <template #column-filter="{ column }">
        <UiFilterPopover
          v-if="column.id === 'status'"
          v-model="selectedStatuses"
          :options="statusFilterOptions"
          aria-label="Nach Status filtern"
        />
      </template>

      <template #cell="{ cell, row }">
        <template v-if="cell.column.id === 'actions'">
          <div class="flex gap-1">
            <UiIconButton
              v-if="row.original.isPending"
              aria-label="Einladung erneut senden"
              :disabled="resendLoadingId === row.original.id"
              @click="handleResendInvitation(row.original)"
            >
              <PaperAirplaneIcon class="size-5" />
            </UiIconButton>
            <UiIconButton
              aria-label="Rolle ändern"
              @click="openRoleModal(row.original)"
            >
              <Cog6ToothIcon class="size-5" />
            </UiIconButton>
            <UiIconButton
              aria-label="Löschen"
              @click="handleDelete(row.original.id)"
            >
              <TrashIcon class="size-5" />
            </UiIconButton>
          </div>
        </template>
        <template v-else-if="cell.column.id === 'email'">
          <a
            :href="`mailto:${row.original.email}`"
            class="text-primary hover:underline"
          >
            {{ row.original.email }}
          </a>
        </template>
        <template v-else-if="cell.column.id === 'phoneNumber'">
          <a
            v-if="row.original.phoneNumber"
            :href="`tel:${row.original.phoneNumber.replace(/\s/g, '')}`"
            class="text-primary hover:underline"
          >
            {{ row.original.phoneNumber }}
          </a>
        </template>
        <template v-else>
          <FlexRender
            :render="cell.column.columnDef.cell"
            :props="cell.getContext()"
          />
        </template>
      </template>
    </UiDataTable>

    <UiModal v-model:open="showRoleModal" title="Rolle ändern">
      <form class="flex flex-col gap-4" @submit.prevent="handleRoleChange">
        <p class="text-sm text-gray-600">
          {{ editingUser ? getUserDisplayName(editingUser) : '' }}
          <span class="text-gray-400">({{ editingUser?.email }})</span>
        </p>
        <UiInputField id="edit-role" label="Rolle">
          <select
            id="edit-role"
            v-model="editRole"
            class="min-w-0 flex-1 bg-transparent outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </UiInputField>
        <UiButton type="submit" class="self-end">Speichern</UiButton>
      </form>
    </UiModal>
  </UiPage>
</template>
