import { readValidatedBody } from 'h3';
import { shiftAvailabilityUpsertSchema } from '#server/entities/shift-availability/shift-availability.schema';
import { shiftAvailabilityService } from '#server/entities/shift-availability/shift-availability.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';

export default defineEventHandler(async (event) => {
  const userId = event.context.user!.id;
  const body = await readValidatedBody(
    event,
    shiftAvailabilityUpsertSchema.parse,
  );

  try {
    return await shiftAvailabilityService.upsert(userId, body);
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
