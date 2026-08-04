import { calendarEntryService } from '#server/entities/calendar-entry/calendar-entry.service';

export default defineEventHandler(() => {
  return { url: calendarEntryService.getFeedUrl() };
});
