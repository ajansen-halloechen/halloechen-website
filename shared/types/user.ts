import type { z } from 'zod';
import type {
  userCreateSchema,
  userInternalSchema,
  userLoginSchema,
  userPatchSchema,
  userRoleSchema,
  userSchema,
  userSetupSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
} from '#server/entities/user/user.schema';

export type User = z.infer<typeof userSchema>;
export type UserInternal = z.infer<typeof userInternalSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserSetup = z.infer<typeof userSetupSchema>;
export type UserPatch = z.infer<typeof userPatchSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;

export const UserRole = { user: 'user', admin: 'admin' } as const;
