import type { z } from 'zod';
import type {
  shiftAssignmentPairSchema,
  shiftAssignmentPlanModeSchema,
  shiftAssignmentPlanResultSchema,
  shiftAssignmentReplaceSchema,
  shiftAssignmentSchema,
} from '#server/entities/shift-assignment/shift-assignment.schema';

export type ShiftAssignment = z.infer<typeof shiftAssignmentSchema>;
export type ShiftAssignmentPair = z.infer<typeof shiftAssignmentPairSchema>;
export type ShiftAssignmentReplace = z.infer<
  typeof shiftAssignmentReplaceSchema
>;
export type ShiftAssignmentPlanMode = z.infer<
  typeof shiftAssignmentPlanModeSchema
>;
export type ShiftAssignmentPlanResult = z.infer<
  typeof shiftAssignmentPlanResultSchema
>;
