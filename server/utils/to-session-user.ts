import type { User } from '#shared/types/user';
import { resolveAvatarUrl } from '#server/utils/files/avatar-url';

export function toSessionUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    avatar: resolveAvatarUrl(user.avatar),
  };
}
