import { z } from 'zod';

export const availabilityStatusSchema = z.enum([
  'available',
  'preference',
  'unavailable',
]);

export const shiftAvailabilitySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  plannedShiftId: z.uuid(),
  status: availabilityStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const shiftAvailabilityUpsertSchema = z.object({
  plannedShiftId: z.uuid(),
  status: availabilityStatusSchema,
});
