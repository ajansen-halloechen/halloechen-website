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
import { createUserAvatarColumn } from '~/utils/user-table-columns';
import { getUserDisplayName } from '~/utils/user-display';

const { success, error } = useToast();
const { highlightedRowId, highlightRow } = useTableRowHighlight();

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { user: currentUser } = useUserSession();

const { data: users, refresh: refreshUsers } =
  await useFetch<User[]>('/api/users');

async function handleUserSaved(idOrEmail: string) {
  await refreshUsers();
  const match =
    users.value?.find((u) => u.id === idOrEmail) ??
    users.value?.find((u) => u.email === idOrEmail);
  if (match) highlightRow(match.id);
}

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
const showDeleteModal = ref(false);
const showProfileModal = ref(false);
const editingUser = ref<User>();
const deletingUser = ref<User>();
const profileUser = ref<User>();

const resendLoadingId = ref<string | null>(null);

const isAdmin = computed(() => currentUser.value?.role === UserRole.admin);

function getUserSortKey(user: User): string {
  return getUserDisplayName(user);
}

function getUserStatus(user: User): string {
  return user.isPending ? 'Eingeladen' : 'Aktiv';
}

function getRoleLabel(role: User['role']): string {
  return role === 'admin' ? 'Admin' : 'User';
}

const columnHelper = createColumnHelper<User>();

const avatarColumn = createUserAvatarColumn(columnHelper);

const baseColumns = [
  columnHelper.accessor((row) => getUserSortKey(row), {
    id: 'displayName',
    header: 'Genoss*in',
    cell: (info) => getUserDisplayName(info.row.original),
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
  columnHelper.accessor('role', {
    header: 'Rolle',
    cell: (info) => getRoleLabel(info.getValue()),
    enableSorting: false,
  }),
];

const actionsColumn = columnHelper.display({
  id: 'actions',
  header: 'Aktionen',
});

const table = useVueTable({
  get data() {
    return users.value ?? [];
  },
  get columns() {
    const cols = [avatarColumn, ...baseColumns];
    if (isAdmin.value) cols.push(actionsColumn);
    return cols;
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
    return [
      getUserDisplayName(u),
      u.email,
      u.phoneNumber,
      getUserStatus(u),
      getRoleLabel(u.role),
    ]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search));
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

function openRoleModal(user: User) {
  editingUser.value = user;
  showRoleModal.value = true;
}

function openDeleteModal(user: User) {
  deletingUser.value = user;
  showDeleteModal.value = true;
}

function openProfileModal(user: User) {
  profileUser.value = user;
  showProfileModal.value = true;
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
</script>

<template>
  <UiPage heading="Genoss*innen" size="xl">
    <UiDataTable
      v-model:global-search="globalSearch"
      :table="table"
      :show-search="true"
      :highlighted-row-id="highlightedRowId"
    >
      <template #actions>
        <UserInviteModal
          v-if="isAdmin"
          v-model:open="showCreateModal"
          @success="handleUserSaved"
        >
          <template #trigger>
            <UiIconButton variant="solid" tooltip="Genoss*in einladen">
              <PlusIcon class="size-6" />
            </UiIconButton>
          </template>
        </UserInviteModal>
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
              tooltip="Rolle ändern"
              @click="openRoleModal(row.original)"
            >
              <Cog6ToothIcon class="size-5" />
            </UiIconButton>
            <UiIconButton
              color="error"
              tooltip="Genoss*in löschen"
              @click="openDeleteModal(row.original)"
            >
              <TrashIcon class="size-5" />
            </UiIconButton>
            <UiIconButton
              v-if="row.original.isPending"
              tooltip="Einladung erneut senden"
              :disabled="resendLoadingId === row.original.id"
              @click="handleResendInvitation(row.original)"
            >
              <PaperAirplaneIcon class="size-5" />
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
        <template v-else-if="cell.column.id === 'avatar'">
          <UserCell
            part="avatar"
            :user="row.original"
            @profile="openProfileModal"
          />
        </template>
        <template v-else-if="cell.column.id === 'displayName'">
          <UserCell part="name" :user="row.original" />
        </template>
        <template v-else>
          <FlexRender
            :render="cell.column.columnDef.cell"
            :props="cell.getContext()"
          />
        </template>
      </template>
    </UiDataTable>

    <UserRoleModal
      v-model:open="showRoleModal"
      :user="editingUser"
      @success="handleUserSaved"
    />

    <UserDeleteModal
      v-model:open="showDeleteModal"
      :user="deletingUser"
      @success="refreshUsers()"
    />

    <UserProfileModal v-model:open="showProfileModal" :user="profileUser" />
  </UiPage>
</template>
