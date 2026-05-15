import { workingHourService } from '#server/entities/working-hour/working-hour.service';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!;
  return workingHourService.getById(id);
});
