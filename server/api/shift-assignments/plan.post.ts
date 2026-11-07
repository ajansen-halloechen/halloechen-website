import { shiftAssignmentPlanModeSchema } from '#server/entities/shift-assignment/shift-assignment.schema';
import { shiftAssignmentService } from '#server/entities/shift-assignment/shift-assignment.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { parseMonthParam } from '#server/utils/parse-month';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const query = getQuery(event);
  const monthStr = typeof query.month === 'string' ? query.month : undefined;
  const { year, month } = parseMonthParam(monthStr);

  const modeRaw = typeof query.mode === 'string' ? query.mode : 'replace';
  const modeParsed = shiftAssignmentPlanModeSchema.safeParse(modeRaw);
  if (!modeParsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid mode. Expected replace or fill.',
    });
  }

  try {
    return await shiftAssignmentService.planMonth(
      { id: event.context.user!.id, role: event.context.user!.role },
      year,
      month,
      modeParsed.data,
    );
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
