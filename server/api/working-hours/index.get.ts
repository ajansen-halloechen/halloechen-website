import { workingHourService } from '#server/entities/working-hour/working-hour.service';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const monthStr = typeof query.month === 'string' ? query.month : undefined;

  if (monthStr) {
    const match = monthStr.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid month format. Expected YYYY-MM.',
      });
    }
    return workingHourService.getAll({
      year: Number(match[1]),
      month: Number(match[2]),
    });
  }

  return workingHourService.getAll();
});
