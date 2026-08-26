import { plannedShiftService } from '#server/entities/planned-shift/planned-shift.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id')!;

  try {
    return await plannedShiftService.remove(event.context.user!.role, id);
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
