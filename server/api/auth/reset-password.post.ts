import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { passwordResetConfirmSchema } from '#server/entities/user/user.schema';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, passwordResetConfirmSchema.parse);
  return userService.resetPassword(body);
});
