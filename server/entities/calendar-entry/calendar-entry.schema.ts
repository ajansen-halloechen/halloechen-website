import { z } from 'zod';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
} from '~~/shared/time-range-validation';

export const calendarEntryTypeSchema = z.enum([
  'publicEvent',
  'internalEvent',
  'reservation',
]);

export const calendarEntrySchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000),
  startDate: z.date(),
  startTime: z.iso.time(),
  endDate: z.date(),
  endTime: z.iso.time(),
  type: calendarEntryTypeSchema,
  createdByUserId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const DEFAULT_END_TIME = '23:59:00';

export const calendarEntryCreateSchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).default(''),
    startDate: z.coerce.date(),
    startTime: z.iso.time(),
    endDate: z.coerce.date().optional(),
    endTime: z.iso.time().optional(),
    type: calendarEntryTypeSchema,
  })
  .transform((data) => ({
    ...data,
    endDate: data.endDate ?? data.startDate,
    endTime: data.endTime ?? DEFAULT_END_TIME,
  }))
  .refine((data) => validateDateTimeRange(data) === null, {
    message: dateTimeRangeValidationMessage('end_before_start'),
    path: ['endDate'],
  });

export const calendarEntryPatchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  startDate: z.coerce.date().optional(),
  startTime: z.iso.time().optional(),
  endDate: z.coerce.date().optional(),
  endTime: z.iso.time().optional(),
  type: calendarEntryTypeSchema.optional(),
});
