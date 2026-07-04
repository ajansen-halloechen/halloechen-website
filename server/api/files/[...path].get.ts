import {
  assertSafePath,
  contentTypeFromPath,
  getFile,
} from '#server/utils/files/storage';

export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, 'path');
  if (!pathParam) {
    throw createError({ statusCode: 400, statusMessage: 'Path is required' });
  }

  const key = assertSafePath(pathParam);
  const data = await getFile(key);

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' });
  }

  setHeader(event, 'Content-Type', contentTypeFromPath(key));
  setHeader(event, 'Cache-Control', 'private, max-age=3600');

  return data;
});
