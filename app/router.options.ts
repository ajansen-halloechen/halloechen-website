import type { RouterConfig } from "nuxt/schema";

const sectionObserverLock = useRouterScrollLock();

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;

    if (sectionObserverLock.getLockState()) {
      console.log("Scroll triggered navigation, not changing scroll position");
      sectionObserverLock.release();
      return false;
    }

    if (to.hash) {
      console.log("Scrolling to hash:", to.hash);

      const el = document.querySelector<HTMLElement>(to.hash);
      if (el) {
        const headerOffset = 72;
        const top =
          el.getBoundingClientRect().top + window.scrollY - headerOffset;
        return { left: 0, top, behavior: "instant" as const };
      }
    }

    return { left: 0, top: 0 };
  },
};
