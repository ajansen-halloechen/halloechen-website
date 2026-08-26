import { readValidatedBody } from 'h3';
import { plannedShiftCreateSchema } from '#server/entities/planned-shift/planned-shift.schema';
import { plannedShiftService } from '#server/entities/planned-shift/planned-shift.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readValidatedBody(event, plannedShiftCreateSchema.parse);

  try {
    const shift = await plannedShiftService.create(
      event.context.user!.role,
      body,
    );
    setResponseStatus(event, 201);
    return shift;
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
