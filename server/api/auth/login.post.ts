import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { userLoginSchema } from '#server/entities/user/user.schema';
import { toSessionUser } from '#server/utils/to-session-user';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, userLoginSchema.parse);
  const user = await userService.login(body.email, body.password);

  await setUserSession(event, {
    user: toSessionUser(user),
  });

  return user;
});
