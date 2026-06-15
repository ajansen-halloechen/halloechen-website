import { userService } from '#server/entities/user/user.service';
import { deleteFile } from '#server/utils/files/storage';
import { toSessionUser } from '#server/utils/to-session-user';

export default defineEventHandler(async (event) => {
  const { id } = event.context.user!;

  const currentUser = await userService.getByIdInternal(id);
  const oldAvatar = currentUser.avatar;

  if (oldAvatar) {
    try {
      await deleteFile(oldAvatar);
    } catch {
      console.warn(`Failed to delete avatar file: ${oldAvatar}`);
    }
  }

  const user = await userService.setAvatar(id, null);

  await setUserSession(event, { user: toSessionUser(user) });

  return user;
});
