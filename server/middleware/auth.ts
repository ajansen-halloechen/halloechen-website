import type { H3Event } from 'h3';
import { SESSION_EXPIRED_MESSAGE } from '#shared/constants/auth';
import { validateSessionUser } from '#server/utils/validate-session';

export default defineEventHandler(async (event: H3Event) => {
  const path: string = getRequestURL(event).pathname;

  if (
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/_auth/') ||
    path === '/api/public-calendar-entries' ||
    path.startsWith('/api/calendar-feed/')
  ) {
    return;
  }

  if (path.startsWith('/api/')) {
    const session = await getUserSession(event);
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const validUser = await validateSessionUser(event, session.user);
    if (!validUser) {
      await clearUserSession(event);
      throw createError({
        statusCode: 401,
        statusMessage: SESSION_EXPIRED_MESSAGE,
      });
    }

    event.context.user = validUser;
  }
});
