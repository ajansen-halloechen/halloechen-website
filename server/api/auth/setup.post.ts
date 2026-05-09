import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { userSetupSchema } from '#server/entities/user/user.schema';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, userSetupSchema.parse);
  return userService.setup(body);
});
