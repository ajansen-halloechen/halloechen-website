import { workingHourService } from '#server/entities/working-hour/working-hour.service';

export default defineEventHandler(() => {
  return workingHourService.getAll();
});
