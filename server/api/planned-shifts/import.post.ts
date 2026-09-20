import { readValidatedBody } from 'h3';
import { plannedShiftImportSchema } from '#server/entities/planned-shift/planned-shift.schema';
import { plannedShiftService } from '#server/entities/planned-shift/planned-shift.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { parseMonthParam } from '#server/utils/parse-month';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readValidatedBody(event, plannedShiftImportSchema.parse);
  const { year, month } = parseMonthParam(body.month);

  try {
    const created = await plannedShiftService.importFromTemplates(
      event.context.user!.role,
      year,
      month,
    );
    setResponseStatus(event, 201);
    return created;
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
