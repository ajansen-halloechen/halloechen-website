import { z } from 'zod';

export const shiftAssignmentSchema = z.object({
  id: z.uuid(),
  plannedShiftId: z.uuid(),
  userId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
