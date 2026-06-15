import { createError } from 'h3';

const FILES_STORAGE = 'files';

function getStorage() {
  return useStorage(FILES_STORAGE);
}

export function assertSafePath(path: string): string {
  if (!path || path.startsWith('/') || path.includes('\\')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file path' });
  }

  const segments = path.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file path' });
  }

  return path;
}

export async function getFile(key: string) {
  const safeKey = assertSafePath(key);
  return getStorage().getItemRaw(safeKey);
}

export async function putFile(key: string, data: Buffer | Uint8Array) {
  const safeKey = assertSafePath(key);
  await getStorage().setItemRaw(safeKey, data);
}

export async function deleteFile(key: string) {
  const safeKey = assertSafePath(key);
  await getStorage().removeItem(safeKey);
}

const MIME_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  pdf: 'application/pdf',
};

export function contentTypeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}
