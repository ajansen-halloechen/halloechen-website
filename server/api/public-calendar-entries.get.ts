import { calendarEntryService } from '#server/entities/calendar-entry/calendar-entry.service';

function parseMonthQuery(monthStr: unknown) {
  if (typeof monthStr !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Month parameter is required. Expected YYYY-MM.',
    });
  }

  const match = monthStr.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid month format. Expected YYYY-MM.',
    });
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const month = parseMonthQuery(query.month);
  return calendarEntryService.getAll(month, { type: 'publicEvent' });
});
