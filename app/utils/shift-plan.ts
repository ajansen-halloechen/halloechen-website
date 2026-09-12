export const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Montag',
  2: 'Dienstag',
  3: 'Mittwoch',
  4: 'Donnerstag',
  5: 'Freitag',
  6: 'Samstag',
  7: 'Sonntag',
};

/** JS getDay(): 0=Sun … 6=Sat → ISO: 1=Mon … 7=Sun */
export function isoWeekdayFromDate(date: Date | string): number {
  const d =
    typeof date === 'string'
      ? new Date(`${date.slice(0, 10)}T00:00:00Z`)
      : date;
  const day = d.getUTCDay();
  return day === 0 ? 7 : day;
}

export function weekdayLabelFromDate(date: Date | string): string {
  return WEEKDAY_LABELS[isoWeekdayFromDate(date)] ?? '';
}

export function formatTimeRange(
  startTime: string,
  endTime: string,
  plusOneDay: boolean,
): string {
  const start = startTime.slice(0, 5);
  const end = endTime.slice(0, 5);
  return plusOneDay ? `${start} – ${end} (+1)` : `${start} – ${end}`;
}

export function formatIsoDate(date: Date | string): string {
  if (typeof date === 'string') {
    const [y, m, d] = date.slice(0, 10).split('-');
    if (y && m && d) return `${d}.${m}.${y}`;
  }
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

export function toIsoDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function monthParamFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
