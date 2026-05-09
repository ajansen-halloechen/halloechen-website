import type { z } from 'zod';
import type {
  userCreateSchema,
  userLoginSchema,
  userPatchSchema,
  userSchema,
  userSetupSchema,
  userUpdateSchema,
} from '#server/entities/user/user.schema';

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserSetup = z.infer<typeof userSetupSchema>;
export type UserPatch = z.infer<typeof userPatchSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
