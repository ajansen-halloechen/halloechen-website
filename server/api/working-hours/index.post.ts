import { readValidatedBody } from 'h3';
import { workingHourService } from '#server/entities/working-hour/working-hour.service';
import { workingHourCreateSchema } from '#server/entities/working-hour/working-hour.schema';

export default defineEventHandler(async (event) => {
  const userId = event.context.user!.id;
  const body = await readValidatedBody(event, workingHourCreateSchema.parse);
  const workingHour = await workingHourService.create(userId, body);
  setResponseStatus(event, 201);
  return workingHour;
});
