import { z } from 'zod';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';

export const plannedShiftSchema = z.object({
  id: z.uuid(),
  date: z.date(),
  label: z.string().max(255),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  plusOneDay: z.boolean(),
  numberOfPersons: z.number().int().min(1),
  templateId: z.uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const plannedShiftCreateSchema = z
  .object({
    date: z.coerce.date(),
    label: z.string().max(255).default(''),
    startTime: z.iso.time(),
    endTime: z.iso.time(),
    plusOneDay: z.boolean().default(false),
    numberOfPersons: z.number().int().min(1),
    templateId: z.uuid().nullable().optional(),
  })
  .refine(
    (data) =>
      validateDateTimeRange(
        workingHourToDateTimeRange({
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          plusOneDay: data.plusOneDay,
        }),
      ) === null,
    {
      message: dateTimeRangeValidationMessage('end_before_start'),
      path: ['endTime'],
    },
  );

export const plannedShiftImportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM'),
});
