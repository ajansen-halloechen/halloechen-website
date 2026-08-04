import { readValidatedBody } from 'h3';
import { calendarEntryService } from '#server/entities/calendar-entry/calendar-entry.service';
import { calendarEntryPatchSchema } from '#server/entities/calendar-entry/calendar-entry.schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, calendarEntryPatchSchema.parse);
  return calendarEntryService.patch(id, body);
});
