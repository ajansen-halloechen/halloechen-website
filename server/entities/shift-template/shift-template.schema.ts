import { z } from 'zod';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';

const timeRangeRefine = {
  message: dateTimeRangeValidationMessage('end_before_start'),
  path: ['endTime'] as (string | number)[],
};

function isValidTimeRange(data: {
  startTime: string;
  endTime: string;
  plusOneDay: boolean;
}) {
  return (
    validateDateTimeRange(
      workingHourToDateTimeRange({
        date: '2000-01-03', // Monday reference date
        startTime: data.startTime,
        endTime: data.endTime,
        plusOneDay: data.plusOneDay,
      }),
    ) === null
  );
}

export const shiftTemplateSchema = z.object({
  id: z.uuid(),
  label: z.string().max(255),
  weekday: z.number().int().min(1).max(7),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  plusOneDay: z.boolean(),
  numberOfPersons: z.number().int().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const shiftTemplateCreateSchema = z
  .object({
    label: z.string().max(255).default(''),
    weekday: z.number().int().min(1).max(7),
    startTime: z.iso.time(),
    endTime: z.iso.time(),
    plusOneDay: z.boolean().default(false),
    numberOfPersons: z.number().int().min(1),
  })
  .refine(isValidTimeRange, timeRangeRefine);

export const shiftTemplatePatchSchema = z.object({
  label: z.string().max(255).optional(),
  weekday: z.number().int().min(1).max(7).optional(),
  startTime: z.iso.time().optional(),
  endTime: z.iso.time().optional(),
  plusOneDay: z.boolean().optional(),
  numberOfPersons: z.number().int().min(1).optional(),
});
