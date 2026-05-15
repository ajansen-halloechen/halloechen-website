import type { z } from 'zod';
import type {
  activityCreateSchema,
  activitySchema,
} from '#server/entities/activity/activity.schema';

export type Activity = z.infer<typeof activitySchema>;
export type ActivityCreate = z.infer<typeof activityCreateSchema>;
