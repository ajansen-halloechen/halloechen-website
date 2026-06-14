import { userService } from '#server/entities/user/user.service';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id')!;
  return userService.resendInvitation(id);
});
