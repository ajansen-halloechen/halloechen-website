import { z } from 'zod';

export const availabilityStatusSchema = z.enum([
  'available',
  'preference',
  'unavailable',
]);

export const DEFAULT_AVAILABILITY_STATUS = 'available' as const;

export const shiftAvailabilitySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  plannedShiftId: z.uuid(),
  status: availabilityStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const resolvedShiftAvailabilitySchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid(),
  plannedShiftId: z.uuid(),
  status: availabilityStatusSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const shiftAvailabilityUpsertSchema = z.object({
  plannedShiftId: z.uuid(),
  status: availabilityStatusSchema,
});
