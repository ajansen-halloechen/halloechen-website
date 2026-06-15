import { userService } from '#server/entities/user/user.service';
import { deleteFile } from '#server/utils/files/storage';
import { updateSessionUser } from '#server/utils/update-session-user';

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

  await updateSessionUser(event, user);

  return user;
});
