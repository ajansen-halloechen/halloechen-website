<script setup lang="ts" generic="T">
import {
    FlexRender,
    type Table,
    type Cell,
    type Row,
    type Column,
} from '@tanstack/vue-table';
import {
    ChevronUpIcon,
    ChevronDownIcon,
} from '@heroicons/vue/24/outline';

defineProps<{
    table: Table<T>;
    showSearch?: boolean;
}>();

const globalSearch = defineModel<string>('globalSearch', { default: '' });
</script>

<template>
    <div class="flex flex-col gap-4 md:gap-6">
        <div class="flex justify-between items-center">
            <UiSearchField v-if="showSearch !== false" v-model="globalSearch" placeholder="Suchen…" />
            <div v-else />
            <slot name="actions" />
        </div>

        <slot name="toolbar" />

        <div class="mb-10 overflow-x-auto bg-surface rounded-md border border-primary">
            <table class="min-w-full divide-y divide-primary">
                <thead class="bg-primary-100">
                    <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <th
v-for="header in headerGroup.headers" :key="header.id"
                            class="px-4 py-4 text-left text-md font-semibold tracking-wider" :class="{
                                'text-right': (header.column.columnDef.meta as any)?.align === 'right',
                                'w-0': (header.column.columnDef.meta as any)?.shrink,
                            }">
                            <div class="flex items-center gap-1">
                                <FlexRender
v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                                    :props="header.getContext()" />

                                <UiIconButton
v-if="header.column.getCanSort()" aria-label="Sortierung umschalten"
                                    class="ml-1"
                                    @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')">
                                    <ChevronUpIcon v-if="header.column.getIsSorted() === 'asc'" class="size-4" />
                                    <ChevronDownIcon v-else class="size-4" />
                                </UiIconButton>

                                <slot name="column-filter" :column="header.column as Column<T, unknown>" />
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-if="table.getRowModel().rows.length === 0">
                        <td :colspan="table.getAllColumns().length" class="px-4 py-8 text-center text-sm text-gray-500">
                            <slot name="empty">
                                Keine Einträge vorhanden.
                            </slot>
                        </td>
                    </tr>
                    <tr v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-primary/10">
                        <td
v-for="cell in row.getVisibleCells()" :key="cell.id"
                            class="px-4 py-2 whitespace-nowrap text-sm text-gray-700" :class="{
                                'text-right': (cell.column.columnDef.meta as any)?.align === 'right',
                                'w-0': (cell.column.columnDef.meta as any)?.shrink,
                            }">
                            <slot name="cell" :cell="(cell as Cell<T, unknown>)" :row="(row as Row<T>)">
                                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
