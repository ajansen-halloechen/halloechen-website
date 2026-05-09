import type { z } from "zod";
import type { users } from "#server/entities/user/user.schema";
import type {
  createUserSchema,
  updateUserSchema,
} from "#server/entities/user/user.validation";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
