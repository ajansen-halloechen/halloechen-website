import type { CalendarEntry } from '~~/shared/types/calendar-entry';

export type CalendarEvent = {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
};

function toIsoDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function calendarEntryToEvent(entry: CalendarEntry): CalendarEvent {
  const date = toIsoDateString(entry.startDate);
  const time = entry.startTime.slice(0, 8);
  return {
    id: entry.id,
    timestamp: `${date}T${time}`,
    title: entry.title,
    description: entry.description || undefined,
  };
}
