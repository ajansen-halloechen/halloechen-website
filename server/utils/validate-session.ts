import type { H3Event } from 'h3';
import type { User } from '#auth-utils';
import { userService } from '#server/entities/user/user.service';
import { toSessionUser } from '#server/utils/to-session-user';

export async function validateSessionUser(
  _event: H3Event,
  sessionUser: User,
): Promise<User | null> {
  const meta = await userService.getSessionMetaById(sessionUser.id);
  if (!meta) {
    return null;
  }

  const sessionVersion = sessionUser.sessionVersion ?? 0;
  if (sessionVersion !== meta.sessionVersion) {
    return null;
  }

  return toSessionUser(meta);
}
