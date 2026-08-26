import { shiftAvailabilityService } from '#server/entities/shift-availability/shift-availability.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { parseMonthParam } from '#server/utils/parse-month';

export default defineEventHandler(async (event) => {
  const user = event.context.user!;
  const query = getQuery(event);
  const monthStr = typeof query.month === 'string' ? query.month : undefined;
  const allUsers = query.allUsers === 'true' || query.allUsers === true;
  const { year, month } = parseMonthParam(monthStr);

  try {
    return await shiftAvailabilityService.getByMonth(
      { id: user.id, role: user.role },
      year,
      month,
      { allUsers },
    );
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
