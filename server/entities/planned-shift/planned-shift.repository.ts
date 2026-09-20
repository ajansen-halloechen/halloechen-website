import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '#server/database';
import { plannedShifts } from './planned-shift.table';

type PlannedShiftInsert = typeof plannedShifts.$inferInsert;

export const plannedShiftRepository = {
  async findAll() {
    return db.select().from(plannedShifts);
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(plannedShifts)
      .where(eq(plannedShifts.id, id));
    return rows[0] ?? null;
  },

  async findByMonth(year: number, month: number) {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));
    return db
      .select()
      .from(plannedShifts)
      .where(and(gte(plannedShifts.date, from), lt(plannedShifts.date, to)));
  },

  async findByTemplateAndDate(templateId: string, date: Date) {
    const rows = await db
      .select()
      .from(plannedShifts)
      .where(
        and(
          eq(plannedShifts.templateId, templateId),
          eq(plannedShifts.date, date),
        ),
      );
    return rows[0] ?? null;
  },

  async create(data: PlannedShiftInsert) {
    const rows = await db.insert(plannedShifts).values(data).returning();
    return rows[0]!;
  },

  async createMany(data: PlannedShiftInsert[]) {
    if (data.length === 0) return [];
    return db.insert(plannedShifts).values(data).returning();
  },

  async remove(id: string) {
    const rows = await db
      .delete(plannedShifts)
      .where(eq(plannedShifts.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
