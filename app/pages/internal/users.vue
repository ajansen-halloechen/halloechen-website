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
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import { UserRole, type User } from '~~/shared/types/user';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

const { user: currentUser } = useUserSession();

const { data: users, refresh: refreshUsers } = await useFetch<User[]>('/api/users');

const sorting = ref<SortingState>([]);
const globalSearch = ref('');

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingUser = ref<User>();

const newEmail = ref('');
const editFirstName = ref('');
const editLastName = ref('');
const editEmail = ref('');

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('firstName', {
    header: 'Vorname',
    cell: (info) => info.getValue() ?? '—',
    enableSorting: true,
  }),
  columnHelper.accessor('lastName', {
    header: 'Nachname',
    cell: (info) => info.getValue() ?? '—',
    enableSorting: true,
  }),
  columnHelper.accessor('email', {
    header: 'E-Mail',
    enableSorting: true,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Aktionen',
  }),
];

const table = useVueTable({
  get data() {
    return users.value ?? [];
  },
  columns,
  state: {
    get sorting() { return sorting.value; },
    get globalFilter() { return globalSearch.value; },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
  },
  globalFilterFn: (row, _columnId, filterValue: string) => {
    const search = filterValue.toLowerCase();
    const u = row.original;
    return [u.firstName, u.lastName, u.email]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search));
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

function openEditModal(user: User) {
  editingUser.value = user;
  editFirstName.value = user.firstName ?? '';
  editLastName.value = user.lastName ?? '';
  editEmail.value = user.email;
  showEditModal.value = true;
}

async function handleCreate() {
  if (!newEmail.value) return;
  await $fetch('/api/users', {
    method: 'POST',
    body: { email: newEmail.value },
  });
  newEmail.value = '';
  showCreateModal.value = false;
  await refreshUsers();
}

async function handleEdit() {
  if (!editingUser.value) return;
  await $fetch(`/api/users/${editingUser.value.id}`, {
    method: 'PATCH',
    body: {
      email: editEmail.value || undefined,
      firstName: editFirstName.value || undefined,
      lastName: editLastName.value || undefined,
    },
  });
  showEditModal.value = false;
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
    <UiDataTable :table="table" v-model:global-search="globalSearch" :show-search="true">
      <template #actions>
        <UiModal v-if="currentUser?.role === UserRole.admin" v-model:open="showCreateModal" title="Genoss*in einladen">
          <template #trigger>
            <UiIconButton variant="solid" aria-label="Genoss*in einladen">
              <PlusIcon class="size-6" />
            </UiIconButton>
          </template>
          <form class="flex flex-col gap-4" @submit.prevent="handleCreate">
            <UiInputField id="new-email" v-model="newEmail" label="E-Mail" type="email" required />
            <UiButton type="submit" class="self-end">Einladen</UiButton>
          </form>
        </UiModal>
      </template>

      <template #cell="{ cell, row }">
        <template v-if="cell.column.id === 'actions'">
          <div class="flex gap-1">
            <UiIconButton aria-label="Bearbeiten" @click="openEditModal(row.original)">
              <PencilIcon class="size-5" />
            </UiIconButton>
            <UiIconButton aria-label="Löschen" @click="handleDelete(row.original.id)">
              <TrashIcon class="size-5" />
            </UiIconButton>
          </div>
        </template>
        <template v-else>
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
        </template>
      </template>
    </UiDataTable>

    <UiModal v-model:open="showEditModal" title="Genoss*in bearbeiten">
      <form class="flex flex-col gap-4" @submit.prevent="handleEdit">
        <UiInputField id="edit-first-name" v-model="editFirstName" label="Vorname" />
        <UiInputField id="edit-last-name" v-model="editLastName" label="Nachname" />
        <UiInputField id="edit-email" v-model="editEmail" label="E-Mail" type="email" required />
        <UiButton type="submit" class="self-end">Speichern</UiButton>
      </form>
    </UiModal>
  </UiPage>
</template>
