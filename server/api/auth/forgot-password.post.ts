import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { passwordResetRequestSchema } from '#server/entities/user/user.schema';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, passwordResetRequestSchema.parse);
  await userService.requestPasswordReset(body.email);

  setResponseStatus(event, 204);
  return null;
});
