import { shiftTemplateService } from '#server/entities/shift-template/shift-template.service';
import { mapDomainErrorToHttp } from '#server/utils/domain-errors';

export default defineEventHandler(async () => {
  try {
    return await shiftTemplateService.getAll();
  } catch (error) {
    mapDomainErrorToHttp(error);
  }
});
