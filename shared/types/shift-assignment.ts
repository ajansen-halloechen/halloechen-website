import type { z } from 'zod';
import type { shiftAssignmentSchema } from '#server/entities/shift-assignment/shift-assignment.schema';

export type ShiftAssignment = z.infer<typeof shiftAssignmentSchema>;
