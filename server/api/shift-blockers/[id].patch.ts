import { readValidatedBody } from 'h3';
import { shiftBlockerService } from '#server/entities/shift-blocker/shift-blocker.service';
import { shiftBlockerPatchSchema } from '#server/entities/shift-blocker/shift-blocker.schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  const userId = event.context.user!.id;
  const body = await readValidatedBody(event, shiftBlockerPatchSchema.parse);
  return shiftBlockerService.patch(id, body, userId);
});
