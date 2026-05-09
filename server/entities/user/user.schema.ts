import { z } from 'zod';

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userWithPasswordSchema = userSchema.extend({
  password: z.string(),
});

export const userCreateSchema = z.object({
  email: z.email(),
});

export const userUpdateSchema = z.object({
  email: z.email().optional(),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
});


