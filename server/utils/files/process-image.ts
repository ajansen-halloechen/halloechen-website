import { createError } from 'h3';
import sharp from 'sharp';

const AVATAR_MAX_SIZE = 512;
const WEBP_QUALITY = 80;

const ALLOWED_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif']);

export async function assertValidImage(data: Buffer): Promise<void> {
  try {
    const metadata = await sharp(data).metadata();
    if (!metadata.format || !ALLOWED_IMAGE_FORMATS.has(metadata.format)) {
      throw new Error('unsupported format');
    }
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid image file' });
  }
}

export async function processAvatarImage(data: Buffer): Promise<Buffer> {
  try {
    return await sharp(data)
      .rotate()
      .resize(AVATAR_MAX_SIZE, AVATAR_MAX_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid image file' });
  }
}
