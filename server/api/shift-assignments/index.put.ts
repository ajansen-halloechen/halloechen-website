import { readValidatedBody } from 'h3';
import { shiftAssignmentReplaceSchema } from '#server/entities/shift-assignment/shift-assignment.schema';
import { shiftAssignmentService } from '#server/entities/shift-assignment/shift-assignment.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readValidatedBody(
    event,
    shiftAssignmentReplaceSchema.parse,
  );

  try {
    return await shiftAssignmentService.replaceForMonth(
      event.context.user!.role,
      body,
    );
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
