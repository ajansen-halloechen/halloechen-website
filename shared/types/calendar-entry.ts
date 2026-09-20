import type { z } from 'zod';
import type {
  calendarEntryCreateSchema,
  calendarEntryPatchSchema,
  calendarEntrySchema,
  calendarEntryTypeSchema,
} from '#server/entities/calendar-entry/calendar-entry.schema';

export type CalendarEntry = z.infer<typeof calendarEntrySchema>;
export type CalendarEntryCreate = z.infer<typeof calendarEntryCreateSchema>;
export type CalendarEntryPatch = z.infer<typeof calendarEntryPatchSchema>;
export type CalendarEntryType = z.infer<typeof calendarEntryTypeSchema>;
