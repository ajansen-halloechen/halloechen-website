import { workingHourService } from '#server/entities/working-hour/working-hour.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  const userId = event.context.user!.id;
  await workingHourService.remove(id, userId);
  setResponseStatus(event, 204);
  return null;
});
