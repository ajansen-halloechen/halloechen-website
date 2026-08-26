import { shiftAssignmentService } from '#server/entities/shift-assignment/shift-assignment.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { parseMonthParam } from '#server/utils/parse-month';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const monthStr = typeof query.month === 'string' ? query.month : undefined;
  const { year, month } = parseMonthParam(monthStr);

  try {
    return await shiftAssignmentService.getByMonth(year, month);
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
