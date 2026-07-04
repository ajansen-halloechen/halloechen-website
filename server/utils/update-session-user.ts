import type { H3Event } from 'h3';
import type { User } from '#shared/types/user';
import { toSessionUser } from '#server/utils/to-session-user';

export async function updateSessionUser(event: H3Event, user: User) {
  const session = await getUserSession(event);
  const { id: _id, ...sessionData } = session;

  await replaceUserSession(event, {
    ...sessionData,
    user: toSessionUser(user),
  });
}
