import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { userSetupSchema } from '#server/entities/user/user.schema';
import { toSessionUser } from '#server/utils/to-session-user';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, userSetupSchema.parse);
  const user = await userService.setup(body);

  await setUserSession(event, {
    user: toSessionUser(user),
  });

  setResponseStatus(event, 204);
  return null;
});
