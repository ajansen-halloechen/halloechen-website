const BAR_TIMEZONE = 'Europe/Berlin';

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Thu–Sat evenings and spillover until 01:00 the next morning (Berlin time). */
const OPENING_DAYS = new Set([4, 5, 6]);
const SPILLOVER_DAYS = new Set([5, 6, 0]);

const OPEN_MARQUEE_TEXT = 'Wir haben offen - Kommt rum!!!\u00a0';
const CLOSED_THURSDAY_MARQUEE_TEXT =
  'Wir haben ab Donnerstag 18:00 Uhr wieder offen!\u00a0';
const CLOSED_TONIGHT_MARQUEE_TEXT =
  'Wir haben ab heute Abend 18:00 Uhr wieder offen!\u00a0';

type BerlinTime = {
  dayOfWeek: number;
  minutesSinceMidnight: number;
};

function getBerlinTime(date: Date): BerlinTime {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BAR_TIMEZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value);

  return {
    dayOfWeek: WEEKDAY_TO_INDEX[weekday] ?? 0,
    minutesSinceMidnight: (hour === 24 ? 0 : hour) * 60 + minute,
  };
}

function isBarOpenAt(time: BerlinTime): boolean {
  if (time.minutesSinceMidnight < 60) {
    return SPILLOVER_DAYS.has(time.dayOfWeek);
  }

  if (time.minutesSinceMidnight >= 18 * 60) {
    return OPENING_DAYS.has(time.dayOfWeek);
  }

  return false;
}

function getClosedMarqueeText(time: BerlinTime): string {
  const isFridayOrSaturday = time.dayOfWeek === 5 || time.dayOfWeek === 6;

  if (isFridayOrSaturday) {
    return CLOSED_TONIGHT_MARQUEE_TEXT;
  }

  return CLOSED_THURSDAY_MARQUEE_TEXT;
}

export function getOpeningHoursMarqueeText(date: Date = new Date()): string {
  const time = getBerlinTime(date);

  if (isBarOpenAt(time)) {
    return OPEN_MARQUEE_TEXT;
  }

  return getClosedMarqueeText(time);
}
