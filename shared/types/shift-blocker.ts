import type { z } from 'zod';
import type {
  shiftBlockerCreateSchema,
  shiftBlockerPatchSchema,
  shiftBlockerSchema,
} from '#server/entities/shift-blocker/shift-blocker.schema';

export type ShiftBlocker = z.infer<typeof shiftBlockerSchema>;
export type ShiftBlockerCreate = z.infer<typeof shiftBlockerCreateSchema>;
export type ShiftBlockerPatch = z.infer<typeof shiftBlockerPatchSchema>;
