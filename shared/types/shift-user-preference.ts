import type { z } from 'zod';
import type {
  resolvedShiftUserPreferenceSchema,
  shiftUserPreferenceSchema,
  shiftUserPreferenceUpsertSchema,
} from '#server/entities/shift-user-preference/shift-user-preference.schema';

export type ShiftUserPreference = z.infer<typeof shiftUserPreferenceSchema>;
export type ResolvedShiftUserPreference = z.infer<
  typeof resolvedShiftUserPreferenceSchema
>;
export type ShiftUserPreferenceUpsert = z.infer<
  typeof shiftUserPreferenceUpsertSchema
>;
