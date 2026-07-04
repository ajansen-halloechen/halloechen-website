import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getFilesStoragePath } from '#server/utils/env';

export default defineNitroPlugin(async () => {
  await mkdir(join(getFilesStoragePath(), 'avatars'), { recursive: true });
});
