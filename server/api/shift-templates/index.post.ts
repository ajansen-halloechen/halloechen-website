import { readValidatedBody } from 'h3';
import { shiftTemplateCreateSchema } from '#server/entities/shift-template/shift-template.schema';
import { shiftTemplateService } from '#server/entities/shift-template/shift-template.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';
import { requireAdmin } from '#server/utils/require-admin';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readValidatedBody(event, shiftTemplateCreateSchema.parse);

  try {
    const template = await shiftTemplateService.create(
      event.context.user!.role,
      body,
    );
    setResponseStatus(event, 201);
    return template;
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
