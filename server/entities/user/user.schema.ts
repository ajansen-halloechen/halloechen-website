import { z } from 'zod';
import { resolveAvatarUrl } from '#server/utils/files/avatar-url';
import { passwordValidationMessage, validatePassword } from '#shared/password';
import {
  normalizePhoneNumber,
  phoneValidationMessage,
  validatePhoneNumber,
} from '#shared/phone';

export const passwordSchema = z.string().superRefine((value, ctx) => {
  const error = validatePassword(value);
  if (error) {
    ctx.addIssue({
      code: 'custom',
      message: passwordValidationMessage(error),
    });
  }
});

export const phoneSchema = z
  .string()
  .superRefine((value, ctx) => {
    const error = validatePhoneNumber(value);
    if (error) {
      ctx.addIssue({
        code: 'custom',
        message: phoneValidationMessage(error),
      });
    }
  })
  .transform((value) => normalizePhoneNumber(value));

export const userRoleSchema = z.enum(['user', 'admin']);

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().max(50).nullable(),
  avatar: z.string().max(512).nullable(),
  role: userRoleSchema,
  isPending: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userInternalSchema = userSchema.omit({ isPending: true }).extend({
  passwordHash: z.string().nullable(),
  setupToken: z.string().nullable(),
  setupTokenExpiresAt: z.date().nullable(),
});

export const toPublicUserSchema = userInternalSchema
  .transform(({ passwordHash, setupToken, setupTokenExpiresAt, ...publicFields }) => ({
    ...publicFields,
    isPending: !passwordHash,
  }))
  .pipe(userSchema);

export function toPublicUser(
  user: z.infer<typeof userInternalSchema>,
): z.infer<typeof userSchema> {
  const publicUser = toPublicUserSchema.parse(user);
  return {
    ...publicUser,
    avatar: resolveAvatarUrl(publicUser.avatar),
  };
}

export const userCreateSchema = z.object({
  email: z.email(),
  role: userRoleSchema.optional().default('user'),
});

export const userSetupSchema = z.object({
  token: z.string(),
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(255),
  lastName: z.string().trim().min(1).max(255),
  phoneNumber: phoneSchema,
});

const userPatchFieldsSchema = z.object({
  email: z.email().optional(),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  phoneNumber: z.union([phoneSchema, z.null()]).optional(),
  role: userRoleSchema.optional(),
  oldPassword: z.string().optional(),
  password: passwordSchema.optional(),
});

function withPasswordRefinement<T extends z.ZodObject>(schema: T) {
  return schema.refine((data) => !data.password || data.oldPassword, {
    message: 'Old password is required when setting a new password',
    path: ['oldPassword'],
  });
}

export const userPatchSchema = withPasswordRefinement(userPatchFieldsSchema);

export const userProfilePatchSchema = withPasswordRefinement(
  userPatchFieldsSchema.omit({ role: true }),
);

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});
