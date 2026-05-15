import { readValidatedBody } from 'h3';
import { activityService } from '#server/entities/activity/activity.service';
import { activityCreateSchema } from '#server/entities/activity/activity.schema';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, activityCreateSchema.parse);
  const activity = await activityService.findOrCreate(body);
  setResponseStatus(event, 201);
  return activity;
});
