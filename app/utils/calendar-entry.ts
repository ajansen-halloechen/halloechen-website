import type { CalendarEntryType } from '~~/shared/types/calendar-entry';

export const calendarEntryTypeLabels: Record<CalendarEntryType, string> = {
  internalEvent: 'Intern',
  reservation: 'Reservierung',
  publicEvent: 'Veranstaltung',
};

export type CalendarEntryTypeBadgeColor =
  | 'primary'
  | 'accent'
  | 'warning'
  | 'neutral';

export const calendarEntryTypeColors: Record<
  CalendarEntryType,
  CalendarEntryTypeBadgeColor
> = {
  internalEvent: 'neutral',
  reservation: 'primary',
  publicEvent: 'accent',
};

export const calendarEntryTypes: CalendarEntryType[] = [
  'internalEvent',
  'reservation',
  'publicEvent',
];
