import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/outline';
import type { TopBarItem } from '~/types/top-bar';

const internalNavItems: TopBarItem[] = [
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
  {
    id: 'logout',
    label: '',
    icon: ArrowRightStartOnRectangleIcon,
    tooltip: 'Abmelden',
    to: '/logout',
  },
];

export { internalNavItems };
