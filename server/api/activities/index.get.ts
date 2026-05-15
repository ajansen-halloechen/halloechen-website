import { activityService } from '#server/entities/activity/activity.service';

export default defineEventHandler(() => {
  return activityService.getAll();
});
