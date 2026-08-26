import { eq, inArray } from 'drizzle-orm';
import { db } from '#server/database';
import { shiftAssignments } from './shift-assignment.table';

export const shiftAssignmentRepository = {
  async findByPlannedShiftIds(shiftIds: string[]) {
    if (shiftIds.length === 0) return [];
    return db
      .select()
      .from(shiftAssignments)
      .where(inArray(shiftAssignments.plannedShiftId, shiftIds));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(shiftAssignments)
      .where(eq(shiftAssignments.id, id));
    return rows[0] ?? null;
  },
};
