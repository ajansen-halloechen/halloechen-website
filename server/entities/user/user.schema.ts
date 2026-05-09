import { z } from 'zod';

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  setupToken: z.string().nullable(),
  setupTokenExpiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userInternalSchema = userSchema.extend({
  passwordHash: z.string().nullable(),
});

export const userCreateSchema = z.object({
  email: z.email(),
});

export const userUpdateSchema = z.object({
  email: z.email().optional(),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
});

export const userSetupSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
});

export const userPatchSchema = z
  .object({
    email: z.email().optional(),
    firstName: z.string().min(1).max(255).optional(),
    lastName: z.string().min(1).max(255).optional(),
    oldPassword: z.string().optional(),
    password: z.string().min(8).max(128).optional(),
  })
  .refine((data) => !data.password || data.oldPassword, {
    message: 'Old password is required when setting a new password',
    path: ['oldPassword'],
  });

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});
