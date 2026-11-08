import { shiftAssignmentService } from '#server/entities/shift-assignment/shift-assignment.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const plannedShiftId = getRouterParam(event, 'plannedShiftId')!;

  try {
    await shiftAssignmentService.removeForPlannedShift(
      event.context.user!.role,
      plannedShiftId,
    );
    return { success: true };
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
