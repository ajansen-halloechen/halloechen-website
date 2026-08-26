import { plannedShiftService } from '#server/entities/planned-shift/planned-shift.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { parseMonthParam } from '#server/utils/parse-month';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const monthStr = typeof query.month === 'string' ? query.month : undefined;
  const { year, month } = parseMonthParam(monthStr);

  try {
    return await plannedShiftService.getByMonth(year, month);
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
