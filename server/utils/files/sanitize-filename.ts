import { randomBytes } from 'node:crypto';
import { basename, extname } from 'node:path';

export function sanitizeFilename(originalName: string): string {
  const name = basename(originalName);
  const base = name.slice(0, name.length - extname(name).length);
  const sanitized =
    base
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'avatar';

  const suffix = randomBytes(3).toString('hex');
  return `${sanitized}-${suffix}.webp`;
}
