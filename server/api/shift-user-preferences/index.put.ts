import { readValidatedBody } from 'h3';
import { shiftUserPreferenceUpsertSchema } from '#server/entities/shift-user-preference/shift-user-preference.schema';
import { shiftUserPreferenceService } from '#server/entities/shift-user-preference/shift-user-preference.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';

export default defineEventHandler(async (event) => {
  const userId = event.context.user!.id;
  const body = await readValidatedBody(
    event,
    shiftUserPreferenceUpsertSchema.parse,
  );

  try {
    return await shiftUserPreferenceService.upsert(userId, body);
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
