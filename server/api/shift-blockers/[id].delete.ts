import { shiftBlockerService } from '#server/entities/shift-blocker/shift-blocker.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  const userId = event.context.user!.id;
  await shiftBlockerService.remove(id, userId);
  setResponseStatus(event, 204);
  return null;
});
