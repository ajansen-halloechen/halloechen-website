import type { UserRole } from '#shared/types/user';
import { resolveAvatarUrl } from '#server/utils/files/avatar-url';

type SessionUserSource = {
  id: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  sessionVersion: number;
};

export function toSessionUser(user: SessionUserSource) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    avatar: resolveAvatarUrl(user.avatar),
    sessionVersion: user.sessionVersion,
  };
}
