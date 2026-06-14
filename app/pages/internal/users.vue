<script setup lang="ts">
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useVueTable,
  type SortingState,
  type ColumnDef,
} from '@tanstack/vue-table';
import { PlusIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';
import { UserRole, type User } from '~~/shared/types/user';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { user: currentUser } = useUserSession();

const { data: users, refresh: refreshUsers } =
  await useFetch<User[]>('/api/users');

const sorting = ref<SortingState>([]);
const globalSearch = ref('');

const showCreateModal = ref(false);
const showRoleModal = ref(false);
const editingUser = ref<User>();

const newEmail = ref('');
const newRole = ref<'user' | 'admin'>('user');
const editRole = ref<'user' | 'admin'>('user');

const isAdmin = computed(() => currentUser.value?.role === UserRole.admin);

function getUserDisplayName(user: User): string | null {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return null;
}

const columnHelper = createColumnHelper<User>();

const columns = computed((): ColumnDef<User>[] => {
  const cols: ColumnDef<User>[] = [
    columnHelper.accessor((row) => getUserDisplayName(row), {
      id: 'displayName',
      header: 'Genoss*in',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('email', {
      header: 'E-Mail',
    }),
    columnHelper.accessor('phoneNumber', {
      header: 'Telefon',
      cell: (info) => info.getValue(),
    }),
  ];

  if (isAdmin.value) {
    cols.push(
      columnHelper.display({
        id: 'actions',
        header: 'Aktionen',
      }),
    );
  }

  return cols;
});

const table = useVueTable({
  get data() {
    return users.value ?? [];
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
    const u = row.original;
    return [getUserDisplayName(u), u.email, u.phoneNumber]
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
  await $fetch('/api/users', {
    method: 'POST',
    body: { email: newEmail.value, role: newRole.value },
  });
  newEmail.value = '';
  newRole.value = 'user';
  showCreateModal.value = false;
  await refreshUsers();
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

      <template #cell="{ cell, row }">
        <template v-if="cell.column.id === 'actions'">
          <div class="flex gap-1">
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
