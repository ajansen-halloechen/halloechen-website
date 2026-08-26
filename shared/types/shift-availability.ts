import type { z } from 'zod';
import type {
  availabilityStatusSchema,
  shiftAvailabilitySchema,
  shiftAvailabilityUpsertSchema,
} from '#server/entities/shift-availability/shift-availability.schema';

export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;
export type ShiftAvailability = z.infer<typeof shiftAvailabilitySchema>;
export type ShiftAvailabilityUpsert = z.infer<
  typeof shiftAvailabilityUpsertSchema
>;
