import { workingHourService } from '#server/entities/working-hour/working-hour.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!;
  await workingHourService.remove(id);
  setResponseStatus(event, 204);
  return null;
});
