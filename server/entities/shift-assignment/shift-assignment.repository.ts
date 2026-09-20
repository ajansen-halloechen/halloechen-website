import { eq, inArray } from 'drizzle-orm';
import { db } from '#server/database';
import { shiftAssignments } from './shift-assignment.table';

type ShiftAssignmentInsert = typeof shiftAssignments.$inferInsert;

type DbExecutor = Pick<typeof db, 'delete' | 'insert'>;

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

  async deleteByPlannedShiftIds(shiftIds: string[], executor: DbExecutor = db) {
    if (shiftIds.length === 0) return;
    await executor
      .delete(shiftAssignments)
      .where(inArray(shiftAssignments.plannedShiftId, shiftIds));
  },

  async createMany(data: ShiftAssignmentInsert[], executor: DbExecutor = db) {
    if (data.length === 0) return [];
    return executor.insert(shiftAssignments).values(data).returning();
  },
};
