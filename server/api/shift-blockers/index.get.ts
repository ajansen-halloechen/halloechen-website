import { shiftBlockerService } from '#server/entities/shift-blocker/shift-blocker.service';

export default defineEventHandler((event) => {
  const userId = event.context.user!.id;
  const query = getQuery(event);
  const monthStr = typeof query.month === 'string' ? query.month : undefined;

  if (!monthStr) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Month parameter is required. Expected YYYY-MM.',
    });
  }

  const match = monthStr.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid month format. Expected YYYY-MM.',
    });
  }

  return shiftBlockerService.getAllForUser(userId, {
    year: Number(match[1]),
    month: Number(match[2]),
  });
});
