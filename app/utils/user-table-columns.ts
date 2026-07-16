import type { ColumnHelper } from '@tanstack/vue-table';

export function createUserAvatarColumn<T>(columnHelper: ColumnHelper<T>) {
  return columnHelper.display({
    id: 'avatar',
    header: '',
    enableSorting: false,
  });
}
