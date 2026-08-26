import type { z } from 'zod';
import type {
  plannedShiftCreateSchema,
  plannedShiftImportSchema,
  plannedShiftSchema,
} from '#server/entities/planned-shift/planned-shift.schema';

export type PlannedShift = z.infer<typeof plannedShiftSchema>;
export type PlannedShiftCreate = z.infer<typeof plannedShiftCreateSchema>;
export type PlannedShiftImport = z.infer<typeof plannedShiftImportSchema>;
