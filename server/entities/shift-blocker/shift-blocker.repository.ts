import { and, eq, gte, lte } from 'drizzle-orm';
import { db } from '#server/database';
import { shiftBlockers } from './shift-blocker.table';

type ShiftBlockerInsert = typeof shiftBlockers.$inferInsert;
type ShiftBlockerColumns = typeof shiftBlockers.$inferSelect;

export const shiftBlockerRepository = {
  async findById(id: string) {
    const rows = await db
      .select()
      .from(shiftBlockers)
      .where(eq(shiftBlockers.id, id));
    return rows[0] ?? null;
  },

  async findByUserAndMonth(userId: string, year: number, month: number) {
    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0));

    return db
      .select()
      .from(shiftBlockers)
      .where(
        and(
          eq(shiftBlockers.userId, userId),
          lte(shiftBlockers.startDate, lastDay),
          gte(shiftBlockers.endDate, firstDay),
        ),
      );
  },

  async findByMonth(year: number, month: number) {
    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0));

    return db
      .select()
      .from(shiftBlockers)
      .where(
        and(
          lte(shiftBlockers.startDate, lastDay),
          gte(shiftBlockers.endDate, firstDay),
        ),
      );
  },

  async create(data: ShiftBlockerInsert) {
    const rows = await db.insert(shiftBlockers).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: Partial<ShiftBlockerColumns>) {
    const rows = await db
      .update(shiftBlockers)
      .set(data)
      .where(eq(shiftBlockers.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string) {
    const rows = await db
      .delete(shiftBlockers)
      .where(eq(shiftBlockers.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
