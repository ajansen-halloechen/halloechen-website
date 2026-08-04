import type { CalendarEntryType } from '~~/shared/types/calendar-entry';

export const calendarEntryTypeLabels: Record<CalendarEntryType, string> = {
  publicEvent: 'Veranstaltung',
  internalEvent: 'intern',
  reservation: 'Reservierung',
};
