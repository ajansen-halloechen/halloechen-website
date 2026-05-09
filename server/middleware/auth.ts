import type { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const path: string = getRequestURL(event).pathname;

  if (path.startsWith('/api/auth/')) {
    return;
  }

  if (path.startsWith('/api/')) {
    const session = await getUserSession(event);
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    event.context.user = session.user;
  }
});
