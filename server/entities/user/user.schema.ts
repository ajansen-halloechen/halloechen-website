import { z } from 'zod';
import { passwordValidationMessage, validatePassword } from '#shared/password';

export const passwordSchema = z.string().superRefine((value, ctx) => {
  const error = validatePassword(value);
  if (error) {
    ctx.addIssue({
      code: 'custom',
      message: passwordValidationMessage(error),
    });
  }
});

export const userRoleSchema = z.enum(['user', 'admin']);

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().max(50).nullable(),
  role: userRoleSchema,
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
  role: userRoleSchema.optional().default('user'),
});

export const userSetupSchema = z.object({
  token: z.string(),
  password: passwordSchema,
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  phoneNumber: z.string().min(1).max(50).optional(),
});

export const userPatchSchema = z
  .object({
    email: z.email().optional(),
    firstName: z.string().min(1).max(255).optional(),
    lastName: z.string().min(1).max(255).optional(),
    phoneNumber: z.string().min(1).max(50).nullable().optional(),
    role: userRoleSchema.optional(),
    oldPassword: z.string().optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => !data.password || data.oldPassword, {
    message: 'Old password is required when setting a new password',
    path: ['oldPassword'],
  });

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});
