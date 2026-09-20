import { z } from 'zod';

export const shiftAssignmentSchema = z.object({
  id: z.uuid(),
  plannedShiftId: z.uuid(),
  userId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const shiftAssignmentPairSchema = z.object({
  plannedShiftId: z.uuid(),
  userId: z.uuid(),
});

export const shiftAssignmentReplaceSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM'),
  assignments: z.array(shiftAssignmentPairSchema),
});

export const shiftAssignmentPlanResultSchema = z.object({
  assignments: z.array(shiftAssignmentPairSchema),
});
