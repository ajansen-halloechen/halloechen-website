export type CalendarEvent = {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
};

const descriptionRenovation =
  'Wir bauen um. Falls ihr Lust habt uns zu tatkräftig zu unterstützen, meldet euch gerne bei info@halloechen.de!';

const descriptionInfoEvening =
  'An diesem Abend informieren wir euch über den Stand des Genoßenschaftsprojekts Hallöchen. Kommt vorbei! Es wird auch Getränke geben.';
const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    timestamp: '2026-01-17T10:00:00Z',
    title: 'Umbau',
    description: descriptionRenovation,
  },
  {
    id: '2',
    timestamp: '2026-01-17T18:00:00Z',
    title: 'Infoabend',
    description: descriptionInfoEvening,
  },
  {
    id: '3',
    timestamp: '2026-01-18T10:00:00Z',
    title: 'Umbau',
    description: descriptionRenovation,
  },
  {
    id: '4',
    timestamp: '2026-01-24T10:00:00Z',
    title: 'Umbau',
    description: descriptionRenovation,
  },
  {
    id: '5',
    timestamp: '2026-01-24T18:00:00Z',
    title: 'Infoabend',
    description: descriptionInfoEvening,
  },
  {
    id: '6',
    timestamp: '2026-01-25T10:00:00Z',
    title: 'Umbau',
    description: descriptionRenovation,
  },
];

export function getCalendarEvents(start: Date, end: Date): CalendarEvent[] {
  return calendarEvents.filter((event) => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= start && eventDate <= end;
  });
}
