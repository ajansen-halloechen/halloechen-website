import type { z } from 'zod';
import type {
  shiftAssignmentPairSchema,
  shiftAssignmentPlanResultSchema,
  shiftAssignmentReplaceSchema,
  shiftAssignmentSchema,
} from '#server/entities/shift-assignment/shift-assignment.schema';

export type ShiftAssignment = z.infer<typeof shiftAssignmentSchema>;
export type ShiftAssignmentPair = z.infer<typeof shiftAssignmentPairSchema>;
export type ShiftAssignmentReplace = z.infer<
  typeof shiftAssignmentReplaceSchema
>;
export type ShiftAssignmentPlanResult = z.infer<
  typeof shiftAssignmentPlanResultSchema
>;
