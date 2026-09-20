import { calendarEntryService } from '#server/entities/calendar-entry/calendar-entry.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  await calendarEntryService.remove(id);
  setResponseStatus(event, 204);
  return null;
});
