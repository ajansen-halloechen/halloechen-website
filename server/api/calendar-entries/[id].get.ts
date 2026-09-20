import { calendarEntryService } from '#server/entities/calendar-entry/calendar-entry.service';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!;
  return calendarEntryService.getById(id);
});
