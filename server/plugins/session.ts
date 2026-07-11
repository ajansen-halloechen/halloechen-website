export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session, event) => {
    if (!session.user) {
      return;
    }

    const validUser = await validateSessionUser(event, session.user);
    if (!validUser) {
      await clearUserSession(event);
      delete session.user;
      return;
    }

    session.user = validUser;
  });
});
