import type { z } from 'zod';
import type {
  userCreateSchema,
  userSchema,
  userUpdateSchema,
} from '#server/entities/user/user.schema';

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
