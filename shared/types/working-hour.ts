import type { z } from 'zod';
import type {
  workingHourCreateSchema,
  workingHourPatchSchema,
  workingHourSchema,
} from '#server/entities/working-hour/working-hour.schema';

export type WorkingHour = z.infer<typeof workingHourSchema>;
export type WorkingHourCreate = z.infer<typeof workingHourCreateSchema>;
export type WorkingHourPatch = z.infer<typeof workingHourPatchSchema>;
