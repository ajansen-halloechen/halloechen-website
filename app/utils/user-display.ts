import type { User } from '~~/shared/types/user';

export function getUserDisplayName(user: User): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.email;
}
