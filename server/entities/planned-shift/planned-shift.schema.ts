import { z } from 'zod';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';
import { shiftTypeSchema } from '../shift-template/shift-template.schema';

export const plannedShiftSchema = z.object({
  id: z.uuid(),
  date: z.date(),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  plusOneDay: z.boolean(),
  type: shiftTypeSchema,
  comment: z.string().max(255).nullable(),
  numberOfPersons: z.number().int().min(1),
  templateId: z.uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const plannedShiftCreateSchema = z
  .object({
    date: z.coerce.date(),
    startTime: z.iso.time(),
    endTime: z.iso.time(),
    plusOneDay: z.boolean().default(false),
    type: shiftTypeSchema.default('bar'),
    comment: z.string().max(255).nullable().optional().default(null),
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
