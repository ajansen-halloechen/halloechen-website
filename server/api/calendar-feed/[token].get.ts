import { calendarEntryService } from '#server/entities/calendar-entry/calendar-entry.service';

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, 'token');
  if (!raw?.toLowerCase().endsWith('.ics')) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    });
  }

  const token = raw.slice(0, -4);
  if (!token) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    });
  }

  const ics = await calendarEntryService.getIcsFeed(token);

  setResponseHeader(event, 'Content-Type', 'text/calendar; charset=utf-8');
  setResponseHeader(
    event,
    'Content-Disposition',
    'inline; filename="halloechen.ics"',
  );

  return ics;
});
