import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { userUpdateSchema } from '#server/entities/user/user.schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, userUpdateSchema.parse);
  return userService.update(id, body);
});
