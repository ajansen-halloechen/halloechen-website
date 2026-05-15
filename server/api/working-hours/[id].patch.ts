import { readValidatedBody } from 'h3';
import { workingHourService } from '#server/entities/working-hour/working-hour.service';
import { workingHourPatchSchema } from '#server/entities/working-hour/working-hour.schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, workingHourPatchSchema.parse);
  return workingHourService.patch(id, body);
});
