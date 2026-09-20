export function parseMonthParam(monthStr: string | undefined): {
  year: number;
  month: number;
} {
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

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}
