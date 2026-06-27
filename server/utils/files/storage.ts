import { createError } from 'h3';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { getFilesStoragePath } from '#server/utils/env';

function filePath(key: string): string {
  return join(getFilesStoragePath(), key);
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
  try {
    return await readFile(filePath(safeKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function putFile(key: string, data: Buffer | Uint8Array) {
  const safeKey = assertSafePath(key);
  const path = filePath(safeKey);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}

export async function deleteFile(key: string) {
  const safeKey = assertSafePath(key);
  try {
    await unlink(filePath(safeKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }
    throw error;
  }
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
