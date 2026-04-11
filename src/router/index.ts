import { useRouterScrollLock } from '@/composables/use-router-scroll-lock';
import HomePage from '@/pages/HomePage.vue';
import LegalPage from '@/pages/LegalPage.vue';
import PrivacyPage from '@/pages/PrivacyPage.vue';
import { createRouter, createWebHistory } from 'vue-router';

const sectionObserverLock = useRouterScrollLock();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/legal',
      name: 'legal',
      component: LegalPage,
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyPage,
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;

    if (sectionObserverLock.getLockState()) {
      // If the navigation was triggered by a scroll event, do not change the scroll position
      console.log('Scroll triggered navigation, not changing scroll position');
      sectionObserverLock.release();
      return false;
    }

    if (to.hash) {
      console.log('Scrolling to hash:', to.hash);

      // Scroll to the section, compensating for fixed header height
      const el = document.querySelector<HTMLElement>(to.hash);
      if (el) {
        const headerOffset = 32;
        const top =
          el.getBoundingClientRect().top + window.scrollY - headerOffset;
        return { left: 0, top, behavior: 'instant' };
      }
    }

    return { left: 0, top: 0 };
  },
});

export default router;
