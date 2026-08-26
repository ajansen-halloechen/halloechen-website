import { readValidatedBody } from 'h3';
import { shiftTemplatePatchSchema } from '#server/entities/shift-template/shift-template.schema';
import { shiftTemplateService } from '#server/entities/shift-template/shift-template.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, shiftTemplatePatchSchema.parse);

  try {
    return await shiftTemplateService.patch(
      event.context.user!.role,
      id,
      body,
    );
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
