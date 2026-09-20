import { z } from 'zod';

export const DEFAULT_MAX_SHIFTS_PER_MONTH = 2;
export const DEFAULT_SHIFTS_ON_CONSECUTIVE_DAYS = false;
export const DEFAULT_SHIFTS_IN_CONSECUTIVE_WEEKS = false;

export const shiftUserPreferenceSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  maxShiftsPerMonth: z.number().int().positive(),
  shiftsOnConsecutiveDays: z.boolean(),
  shiftsInConsecutiveWeeks: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const resolvedShiftUserPreferenceSchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid(),
  maxShiftsPerMonth: z.number().int().positive(),
  shiftsOnConsecutiveDays: z.boolean(),
  shiftsInConsecutiveWeeks: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const shiftUserPreferenceUpsertSchema = z.object({
  maxShiftsPerMonth: z.number().int().positive(),
  shiftsOnConsecutiveDays: z.boolean(),
  shiftsInConsecutiveWeeks: z.boolean(),
});
