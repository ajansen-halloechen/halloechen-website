import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import {
  userProfilePatchSchema,
  toPublicUser,
} from '#server/entities/user/user.schema';
import { toSessionUser } from '#server/utils/to-session-user';

export default defineEventHandler(async (event) => {
  const { id } = event.context.user!;
  const body = await readValidatedBody(event, userProfilePatchSchema.parse);
  const user = await userService.patch(id, body);

  await setUserSession(event, { user: toSessionUser(user) });

  return toPublicUser(user);
});
