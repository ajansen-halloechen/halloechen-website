import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '#server/database';
import { workingHours } from './working-hour.table';

type WorkingHourInsert = typeof workingHours.$inferInsert;
type WorkingHourColumns = typeof workingHours.$inferSelect;

export const workingHourRepository = {
  async findAll() {
    return db.select().from(workingHours);
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(workingHours)
      .where(eq(workingHours.id, id));
    return rows[0] ?? null;
  },

  async findByMonth(year: number, month: number) {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));
    return db
      .select()
      .from(workingHours)
      .where(and(gte(workingHours.date, from), lt(workingHours.date, to)));
  },

  async findByUserId(userId: string) {
    return db
      .select()
      .from(workingHours)
      .where(eq(workingHours.userId, userId));
  },

  async create(data: WorkingHourInsert) {
    const rows = await db.insert(workingHours).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: Partial<WorkingHourColumns>) {
    const rows = await db
      .update(workingHours)
      .set(data)
      .where(eq(workingHours.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string) {
    const rows = await db
      .delete(workingHours)
      .where(eq(workingHours.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
