import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export default defineNitroPlugin(async () => {
  const base = process.env.FILES_STORAGE_PATH ?? join(process.cwd(), 'files');
  await mkdir(join(base, 'avatars'), { recursive: true });
});
