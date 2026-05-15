import { z } from 'zod';

export const workingHourSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  activityId: z.uuid(),
  date: z.date(),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  breakInHours: z.number().min(0),
  plusOneDay: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const workingHourCreateSchema = z.object({
  userId: z.uuid(),
  activityId: z.uuid(),
  date: z.date(),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  breakInHours: z.number().min(0).default(0),
  plusOneDay: z.boolean().default(false),
});

export const workingHourPatchSchema = z.object({
  activityId: z.uuid().optional(),
  date: z.date().optional(),
  startTime: z.iso.time().optional(),
  endTime: z.iso.time().optional(),
  breakInHours: z.number().min(0).optional(),
  plusOneDay: z.boolean().optional(),
});
