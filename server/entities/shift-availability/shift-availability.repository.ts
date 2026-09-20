import { and, eq, inArray } from 'drizzle-orm';
import { db } from '#server/database';
import { shiftAvailabilities } from './shift-availability.table';

type ShiftAvailabilityInsert = typeof shiftAvailabilities.$inferInsert;
type AvailabilityStatus = (typeof shiftAvailabilities.$inferSelect)['status'];

export const shiftAvailabilityRepository = {
  async findByPlannedShiftIds(shiftIds: string[], userId?: string) {
    if (shiftIds.length === 0) return [];

    const conditions = [inArray(shiftAvailabilities.plannedShiftId, shiftIds)];
    if (userId) {
      conditions.push(eq(shiftAvailabilities.userId, userId));
    }

    return db
      .select()
      .from(shiftAvailabilities)
      .where(and(...conditions));
  },

  async findByUserAndShift(userId: string, plannedShiftId: string) {
    const rows = await db
      .select()
      .from(shiftAvailabilities)
      .where(
        and(
          eq(shiftAvailabilities.userId, userId),
          eq(shiftAvailabilities.plannedShiftId, plannedShiftId),
        ),
      );
    return rows[0] ?? null;
  },

  async create(data: ShiftAvailabilityInsert) {
    const rows = await db.insert(shiftAvailabilities).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: { status: AvailabilityStatus }) {
    const rows = await db
      .update(shiftAvailabilities)
      .set(data)
      .where(eq(shiftAvailabilities.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
