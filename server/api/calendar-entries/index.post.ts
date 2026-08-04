import { readValidatedBody } from 'h3';
import { calendarEntryService } from '#server/entities/calendar-entry/calendar-entry.service';
import { calendarEntryCreateSchema } from '#server/entities/calendar-entry/calendar-entry.schema';

export default defineEventHandler(async (event) => {
  const userId = event.context.user!.id;
  const body = await readValidatedBody(event, calendarEntryCreateSchema.parse);
  const entry = await calendarEntryService.create(userId, body);
  setResponseStatus(event, 201);
  return entry;
});
