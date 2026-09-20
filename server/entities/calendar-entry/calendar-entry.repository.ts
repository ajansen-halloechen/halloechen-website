import { and, eq, gte, lte } from 'drizzle-orm';
import { db } from '#server/database';
import { calendarEntries } from './calendar-entry.table';
import type { CalendarEntryType } from '#shared/types/calendar-entry';

type CalendarEntryInsert = typeof calendarEntries.$inferInsert;
type CalendarEntryColumns = typeof calendarEntries.$inferSelect;

export const calendarEntryRepository = {
  async findById(id: string) {
    const rows = await db
      .select()
      .from(calendarEntries)
      .where(eq(calendarEntries.id, id));
    return rows[0] ?? null;
  },

  async findByMonth(
    year: number,
    month: number,
    options?: { type?: CalendarEntryType },
  ) {
    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0));

    const conditions = [
      lte(calendarEntries.startDate, lastDay),
      gte(calendarEntries.endDate, firstDay),
    ];

    if (options?.type) {
      conditions.push(eq(calendarEntries.type, options.type));
    }

    return db
      .select()
      .from(calendarEntries)
      .where(and(...conditions));
  },

  async findAll() {
    return db.select().from(calendarEntries);
  },

  async create(data: CalendarEntryInsert) {
    const rows = await db.insert(calendarEntries).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: Partial<CalendarEntryColumns>) {
    const rows = await db
      .update(calendarEntries)
      .set(data)
      .where(eq(calendarEntries.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string) {
    const rows = await db
      .delete(calendarEntries)
      .where(eq(calendarEntries.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
