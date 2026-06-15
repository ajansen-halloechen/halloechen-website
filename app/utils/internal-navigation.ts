import {
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline';
import type { TopBarItem } from '~/types/top-bar';

const internalBaseNavItems: TopBarItem[] = [
  {
    id: 'events',
    label: 'Veranstaltungen',
    to: '/internal/events',
  },
  {
    id: 'working-hours',
    label: 'Zeiterfassung',
    to: '/internal/working-hours',
  },
  { id: 'shifts', label: 'Schichten', to: '/internal/shifts' },
  { id: 'invoices', label: 'Rechnungen', to: '/internal/invoices' },
  { id: 'users', label: 'Genoss*innen', to: '/internal/users' },
];

const logoutNavItem: TopBarItem = {
  id: 'logout',
  label: '',
  icon: ArrowRightStartOnRectangleIcon,
  tooltip: 'Abmelden',
  to: '/logout',
};

function createInternalNavItems(options?: { avatar?: string | null }) {
  const profileNavItem: TopBarItem = {
    id: 'profile',
    label: 'Profil',
    icon: UserCircleIcon,
    imageUrl: options?.avatar ?? null,
    tooltip: 'Profil',
    to: '/internal/profile',
  };

  return [...internalBaseNavItems, profileNavItem, logoutNavItem];
}

export { internalBaseNavItems, logoutNavItem, createInternalNavItems };
