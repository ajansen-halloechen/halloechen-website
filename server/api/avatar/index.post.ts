import { readMultipartFormData } from 'h3';
import { userService } from '#server/entities/user/user.service';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  AVATAR_STORAGE_PREFIX,
  MAX_UPLOAD_SIZE,
} from '#server/utils/files/constants';
import {
  assertValidImage,
  processAvatarImage,
} from '#server/utils/files/process-image';
import { sanitizeFilename } from '#server/utils/files/sanitize-filename';
import { deleteFile, putFile } from '#server/utils/files/storage';
import { updateSessionUser } from '#server/utils/update-session-user';

export default defineEventHandler(async (event) => {
  const { id } = event.context.user!;

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
  }

  const file = formData.find((part) => part.name === 'file' && part.data);
  if (!file?.data || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
  }

  if (file.data.length > MAX_UPLOAD_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File exceeds maximum size of 5MB',
    });
  }

  if (
    !file.type ||
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only image files are allowed',
    });
  }

  const input = Buffer.from(file.data);
  await assertValidImage(input);

  const filename = sanitizeFilename(file.filename);
  const key = `${AVATAR_STORAGE_PREFIX}/${filename}`;
  const processed = await processAvatarImage(input);

  const currentUser = await userService.getByIdInternal(id);
  const oldAvatar = currentUser.avatar;

  let saved = false;

  try {
    await putFile(key, processed);
    saved = true;

    const user = await userService.setAvatar(id, key);

    if (oldAvatar) {
      try {
        await deleteFile(oldAvatar);
      } catch {
        console.warn(`Failed to delete old avatar file: ${oldAvatar}`);
      }
    }

    await updateSessionUser(event, user);

    return user;
  } catch (error) {
    if (saved) {
      try {
        await deleteFile(key);
      } catch {
        console.warn(`Failed to clean up avatar file after error: ${key}`);
      }
    }

    throw error;
  }
});
