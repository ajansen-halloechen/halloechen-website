import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { userSetupSchema } from '#server/entities/user/user.schema';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, userSetupSchema.parse);
  const user = await userService.setup(body);

  await setUserSession(event, {
    user: { id: user.id, email: user.email, role: user.role },
  });

  return user;
});
