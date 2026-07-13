import { z } from 'zod';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';

export const workingHourSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  activityId: z.uuid(),
  date: z.date(),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  breakInHours: z.number().min(0),
  plusOneDay: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const workingHourCreateSchema = z
  .object({
    activityId: z.uuid(),
    date: z.coerce.date(),
    startTime: z.iso.time(),
    endTime: z.iso.time(),
    breakInHours: z.number().min(0).default(0),
    plusOneDay: z.boolean().default(false),
  })
  .refine((data) => validateDateTimeRange(workingHourToDateTimeRange(data)) === null, {
    message: dateTimeRangeValidationMessage('end_before_start'),
    path: ['endTime'],
  });

export const workingHourPatchSchema = z.object({
  activityId: z.uuid().optional(),
  date: z.coerce.date().optional(),
  startTime: z.iso.time().optional(),
  endTime: z.iso.time().optional(),
  breakInHours: z.number().min(0).optional(),
  plusOneDay: z.boolean().optional(),
});
