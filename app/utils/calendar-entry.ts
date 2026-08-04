import type { CalendarEntryType } from '~~/shared/types/calendar-entry';

export const calendarEntryTypeLabels: Record<CalendarEntryType, string> = {
  publicEvent: 'Veranstaltung',
  internalEvent: 'Intern',
  reservation: 'Reservierung',
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
  publicEvent: 'accent',
  internalEvent: 'neutral',
  reservation: 'warning',
};

export const calendarEntryTypes: CalendarEntryType[] = [
  'publicEvent',
  'internalEvent',
  'reservation',
];
