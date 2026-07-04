import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { userCreateSchema } from '#server/entities/user/user.schema';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readValidatedBody(event, userCreateSchema.parse);
  const user = await userService.create(body);
  setResponseStatus(event, 201);
  return user;
});
