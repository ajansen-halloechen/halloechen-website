const HIGHLIGHT_DURATION_MS = 2000;

export function useTableRowHighlight(durationMs = HIGHLIGHT_DURATION_MS) {
  const highlightedRowId = ref<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function scrollToHighlightedRow(id: string) {
    const el = document.querySelector(`[data-row-id="${CSS.escape(id)}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return Boolean(el);
  }

  function highlightRow(id: string) {
    highlightedRowId.value = id;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      highlightedRowId.value = null;
      timer = null;
    }, durationMs);

    void (async () => {
      await nextTick();
      if (scrollToHighlightedRow(id)) return;
      // Month-filter refetch may need an extra frame before the row mounts.
      await nextTick();
      scrollToHighlightedRow(id);
    })();
  }

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return { highlightedRowId, highlightRow };
}
