import { ref, watch, type Ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

export interface UseScrollSpyOptions {
  /**
   * Thresholds for the IntersectionObserver
   * Defaults to 0.00, 0.01, ..., 1.00
   */
  thresholds?: number[];

  /**
   * Duration in milliseconds to hold the router scroll lock
   * after a section change.
   * Defaults to 500ms.
   */
  lockDurationMs?: number;

  /**
   * Base path used when updating the URL.
   * Defaults to '/'.
   */
  basePath?: string;
}

export function useScrollSpy(
  sectionRefs: Ref<HTMLElement | null>[],
  options: UseScrollSpyOptions = {},
) {
  const router = useRouter();
  const routerScrollLock = useRouterScrollLock();

  const visibilityRatios = new Map<HTMLElement, number>();
  const mostVisibleElement = ref<HTMLElement | null>(null);
  const activeSectionId = ref<string | null>(null);

  const thresholds =
    options.thresholds ?? Array.from({ length: 101 }, (_, i) => i / 100);
  const lockDurationMs = options.lockDurationMs ?? 500;
  const basePath = options.basePath ?? '/';

  useIntersectionObserver(
    sectionRefs,
    (entries) => {
      entries.forEach((entry) => {
        visibilityRatios.set(
          entry.target as HTMLElement,
          entry.intersectionRatio,
        );
      });

      let maxRatio = 0;
      let mostVisibleElementLocal: HTMLElement | null = null;

      visibilityRatios.forEach((ratio, element) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          mostVisibleElementLocal = element;
        }
      });

      if (
        mostVisibleElementLocal &&
        mostVisibleElementLocal !== mostVisibleElement.value
      ) {
        mostVisibleElement.value = mostVisibleElementLocal;
      }
    },
    { threshold: thresholds },
  );

  watch(mostVisibleElement, (newElement) => {
    if (!newElement?.id) return;

    const newId = newElement.id;

    if (activeSectionId.value === newId) return;

    activeSectionId.value = newId;

    routerScrollLock.lock();
    setTimeout(() => {
      routerScrollLock.release();
    }, lockDurationMs);

    router.replace({ path: basePath, hash: `#${newId}` });
  });

  return {
    mostVisibleElement,
    activeSectionId,
  };
}
