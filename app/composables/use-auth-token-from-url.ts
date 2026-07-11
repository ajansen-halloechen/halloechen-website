function readTokenFromQuery(query: Record<string, unknown>): string {
  const value = query.token;
  return typeof value === 'string' ? value : '';
}

export function useAuthTokenFromUrl() {
  const route = useRoute();
  const router = useRouter();

  const token = ref(readTokenFromQuery(route.query));
  const tokenMissing = computed(() => !token.value);

  onMounted(() => {
    token.value = readTokenFromQuery(route.query);

    if (!route.query.token) {
      return;
    }

    const { token: _token, ...queryWithoutToken } = route.query;
    router.replace({ path: route.path, query: queryWithoutToken });
  });

  return { token, tokenMissing };
}
