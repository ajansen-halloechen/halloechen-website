import { z } from 'zod';

export const shiftBlockerSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  startDate: z.date(),
  startTime: z.iso.time(),
  endDate: z.date(),
  endTime: z.iso.time(),
  description: z.string().max(500),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const shiftBlockerCreateSchema = z.object({
  startDate: z.coerce.date(),
  startTime: z.iso.time(),
  endDate: z.coerce.date(),
  endTime: z.iso.time(),
  description: z.string().max(500).default(''),
});

export const shiftBlockerPatchSchema = z.object({
  startDate: z.coerce.date().optional(),
  startTime: z.iso.time().optional(),
  endDate: z.coerce.date().optional(),
  endTime: z.iso.time().optional(),
  description: z.string().max(500).optional(),
});
