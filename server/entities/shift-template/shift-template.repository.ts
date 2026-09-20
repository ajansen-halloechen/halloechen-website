import { eq } from 'drizzle-orm';
import { db } from '#server/database';
import { shiftTemplates } from './shift-template.table';

type ShiftTemplateInsert = typeof shiftTemplates.$inferInsert;
type ShiftTemplateColumns = typeof shiftTemplates.$inferSelect;

export const shiftTemplateRepository = {
  async findAll() {
    return db.select().from(shiftTemplates);
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(shiftTemplates)
      .where(eq(shiftTemplates.id, id));
    return rows[0] ?? null;
  },

  async create(data: ShiftTemplateInsert) {
    const rows = await db.insert(shiftTemplates).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: Partial<ShiftTemplateColumns>) {
    const rows = await db
      .update(shiftTemplates)
      .set(data)
      .where(eq(shiftTemplates.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string) {
    const rows = await db
      .delete(shiftTemplates)
      .where(eq(shiftTemplates.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
