import { readValidatedBody } from 'h3';
import { shiftBlockerService } from '#server/entities/shift-blocker/shift-blocker.service';
import { shiftBlockerCreateSchema } from '#server/entities/shift-blocker/shift-blocker.schema';

export default defineEventHandler(async (event) => {
  const userId = event.context.user!.id;
  const body = await readValidatedBody(event, shiftBlockerCreateSchema.parse);
  const shiftBlocker = await shiftBlockerService.create(userId, body);
  setResponseStatus(event, 201);
  return shiftBlocker;
});
