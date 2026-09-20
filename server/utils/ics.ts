import type { CalendarEntryType } from '#shared/types/calendar-entry';

const TYPE_LABELS: Record<CalendarEntryType, string> = {
  publicEvent: 'Veranstaltung',
  internalEvent: 'Intern',
  reservation: 'Reservierung',
};

type IcsEventInput = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  type: CalendarEntryType;
  updatedAt: Date;
};

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

function foldIcsLine(line: string): string {
  const maxLen = 75;
  if (line.length <= maxLen) return line;

  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, maxLen));
  remaining = remaining.slice(maxLen);

  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, maxLen - 1)}`);
    remaining = remaining.slice(maxLen - 1);
  }

  return parts.join('\r\n');
}

function formatIcsDateTime(date: Date, time: string): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const [hh = '00', mm = '00', ss = '00'] = time.split(':');
  return `${y}${m}${d}T${hh.padStart(2, '0')}${mm.padStart(2, '0')}${(ss || '00').padStart(2, '0')}`;
}

function formatIcsUtcStamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function buildEventLines(entry: IcsEventInput): string[] {
  const typeLabel = TYPE_LABELS[entry.type];
  const summary = `[${typeLabel}] ${entry.title}`;
  const description = entry.description
    ? `${typeLabel}\n${entry.description}`
    : typeLabel;

  return [
    'BEGIN:VEVENT',
    `UID:${entry.id}@halloechen`,
    `DTSTAMP:${formatIcsUtcStamp(entry.updatedAt)}`,
    `DTSTART:${formatIcsDateTime(entry.startDate, entry.startTime)}`,
    `DTEND:${formatIcsDateTime(entry.endDate, entry.endTime)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
  ];
}

export function buildCalendarIcs(
  entries: IcsEventInput[],
  calendarName = 'Hallöchen',
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hallöchen//Calendar//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    ...entries.flatMap(buildEventLines),
    'END:VCALENDAR',
  ];

  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}
