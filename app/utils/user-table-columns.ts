import type { ColumnHelper } from '@tanstack/vue-table';

export function hasAnyUserAvatar(users: { avatar: string | null }[]): boolean {
  return users.some((u) => u.avatar);
}

export function createUserAvatarColumn<T>(columnHelper: ColumnHelper<T>) {
  return columnHelper.display({
    id: 'avatar',
    header: '',
    enableSorting: false,
  });
}
