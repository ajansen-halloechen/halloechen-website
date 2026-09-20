import { shiftTemplateService } from '#server/entities/shift-template/shift-template.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id')!;

  try {
    return await shiftTemplateService.remove(event.context.user!.role, id);
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
