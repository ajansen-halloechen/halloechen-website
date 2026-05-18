export type CalendarEvent = {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
};

const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    timestamp: '2026-05-01T11:00:00Z',
    title: 'Offene Baustelle',
    description:
      'Wir sind noch nicht ganz fertig, aber am 1. Mai öffnen wir schon mal die Türen für Euch! Es wird Getränke und Musik geben!',
  },
  {
    id: '2',
    timestamp: '2026-05-30T12:00:00Z',
    title: 'Eröffnung',
    description:
      'Es ist endlich soweit! Ab 30. Mai haben wir regulär geöffnet. Kommt vorbei! Wir freuen uns RIESIG.',
  },
];

export function getCalendarEvents(start: Date, end: Date): CalendarEvent[] {
  return calendarEvents.filter((event) => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= start && eventDate <= end;
  });
}
