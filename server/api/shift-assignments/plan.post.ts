import { shiftAssignmentService } from '#server/entities/shift-assignment/shift-assignment.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { parseMonthParam } from '#server/utils/parse-month';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const query = getQuery(event);
  const monthStr = typeof query.month === 'string' ? query.month : undefined;
  const { year, month } = parseMonthParam(monthStr);

  try {
    return await shiftAssignmentService.planMonth(
      { id: event.context.user!.id, role: event.context.user!.role },
      year,
      month,
    );
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
