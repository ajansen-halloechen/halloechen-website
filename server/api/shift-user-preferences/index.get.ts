import { shiftUserPreferenceService } from '#server/entities/shift-user-preference/shift-user-preference.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';

export default defineEventHandler(async (event) => {
  const userId = event.context.user!.id;

  try {
    return await shiftUserPreferenceService.getForUser(userId);
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
