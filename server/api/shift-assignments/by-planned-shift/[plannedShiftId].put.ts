import { readValidatedBody } from 'h3';
import { shiftAssignmentReplaceForShiftSchema } from '#server/entities/shift-assignment/shift-assignment.schema';
import { shiftAssignmentService } from '#server/entities/shift-assignment/shift-assignment.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const plannedShiftId = getRouterParam(event, 'plannedShiftId')!;
  const body = await readValidatedBody(
    event,
    shiftAssignmentReplaceForShiftSchema.parse,
  );

  try {
    return await shiftAssignmentService.replaceForPlannedShift(
      event.context.user!.role,
      plannedShiftId,
      body.userIds,
    );
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
