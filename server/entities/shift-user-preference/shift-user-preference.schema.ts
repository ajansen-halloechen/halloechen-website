import { z } from 'zod';

export const DEFAULT_MAX_BAR_SHIFTS_PER_MONTH = 2;
export const DEFAULT_MAX_BAR_SUPPORT_SHIFTS_PER_MONTH = 1;
export const DEFAULT_MAX_CLEANING_SHIFTS_PER_MONTH = 1;
export const DEFAULT_SHIFTS_ON_CONSECUTIVE_DAYS = false;
export const DEFAULT_SHIFTS_IN_CONSECUTIVE_WEEKS = false;

const maxShiftsPerTypeSchema = z.number().int().min(0);

export const shiftUserPreferenceSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  maxBarShiftsPerMonth: maxShiftsPerTypeSchema,
  maxBarSupportShiftsPerMonth: maxShiftsPerTypeSchema,
  maxCleaningShiftsPerMonth: maxShiftsPerTypeSchema,
  shiftsOnConsecutiveDays: z.boolean(),
  shiftsInConsecutiveWeeks: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const resolvedShiftUserPreferenceSchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid(),
  maxBarShiftsPerMonth: maxShiftsPerTypeSchema,
  maxBarSupportShiftsPerMonth: maxShiftsPerTypeSchema,
  maxCleaningShiftsPerMonth: maxShiftsPerTypeSchema,
  shiftsOnConsecutiveDays: z.boolean(),
  shiftsInConsecutiveWeeks: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const shiftUserPreferenceUpsertSchema = z.object({
  maxBarShiftsPerMonth: maxShiftsPerTypeSchema,
  maxBarSupportShiftsPerMonth: maxShiftsPerTypeSchema,
  maxCleaningShiftsPerMonth: maxShiftsPerTypeSchema,
  shiftsOnConsecutiveDays: z.boolean(),
  shiftsInConsecutiveWeeks: z.boolean(),
});
