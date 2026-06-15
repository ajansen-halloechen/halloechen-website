import type { User } from '#shared/types/user';

export function toSessionUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}
