import type { z } from 'zod';
import {
  userRoleSchema,
  type userCreateSchema,
  type userLoginSchema,
  type userPatchSchema,
  type userSchema,
  type userSetupSchema,
} from '#server/entities/user/user.schema';

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserSetup = z.infer<typeof userSetupSchema>;
export type UserPatch = z.infer<typeof userPatchSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;

export const UserRole = userRoleSchema.enum;
