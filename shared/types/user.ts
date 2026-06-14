import type { z } from 'zod';
import type {
  userCreateSchema,
  userLoginSchema,
  userPatchSchema,
  userRoleSchema,
  userSchema,
  userSetupSchema,
} from '#server/entities/user/user.schema';

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserSetup = z.infer<typeof userSetupSchema>;
export type UserPatch = z.infer<typeof userPatchSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;

export const UserRole = { user: 'user', admin: 'admin' } as const;
