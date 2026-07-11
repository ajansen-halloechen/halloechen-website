import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import {
  userPatchSchema,
  toPublicUser,
} from '#server/entities/user/user.schema';
import { requireAdmin } from '#server/utils/require-admin';
import { UserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, userPatchSchema.parse);

  if (body.role !== undefined) {
    requireAdmin(event);
  } else if (
    event.context.user!.id !== id &&
    event.context.user!.role !== UserRole.admin
  ) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  const user = await userService.patch(id, body);
  return toPublicUser(user);
});
