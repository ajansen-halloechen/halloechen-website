import { SESSION_EXPIRED_MESSAGE } from '#shared/constants/auth';

// Handles client-side session revocation (e.g. after password or role change).
//
// Two entry points, one redirect:
// - loggedIn watcher: session fetch returns an empty session (no 401)
// - $fetch interceptor: API calls return 401 Session expired
//
// The interceptor only clears local/cookie state; the watcher performs a
// single redirect. handlingExpiry prevents parallel 401s from causing a loop.
// /api/_auth/ is excluded because the session endpoint clears invalid sessions
// silently on the server.
export default defineNuxtPlugin(() => {
  const { clear, session, loggedIn } = useUserSession();
  const route = useRoute();
  let handlingExpiry = false;

  async function redirectToLogin() {
    if (!route.path.startsWith('/internal')) {
      return;
    }

    await navigateTo('/login', { replace: true });
  }

  watch(loggedIn, (isLoggedIn, wasLoggedIn) => {
    if (isLoggedIn) {
      handlingExpiry = false;
      return;
    }

    if (wasLoggedIn) {
      void redirectToLogin();
    }
  });

  async function handleSessionExpired() {
    if (handlingExpiry) {
      return;
    }

    handlingExpiry = true;
    session.value = null;

    try {
      await clear();
    } catch {
      // The server may have already cleared the session cookie.
    }
  }

  globalThis.$fetch = $fetch.create({
    onResponseError({ request, response }) {
      const url = request.toString();
      if (url.includes('/api/_auth/')) {
        return;
      }

      if (
        response.status === 401 &&
        (response._data as { statusMessage?: string } | undefined)
          ?.statusMessage === SESSION_EXPIRED_MESSAGE
      ) {
        void handleSessionExpired();
      }
    },
  });
});
