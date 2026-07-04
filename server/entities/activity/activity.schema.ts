import { z } from 'zod';

export const activitySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const activityCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
});
