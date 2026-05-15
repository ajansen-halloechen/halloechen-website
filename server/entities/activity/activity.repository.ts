import { asc, eq, sql } from 'drizzle-orm';
import { db } from '#server/database';
import { activities } from './activity.table';

type ActivityInsert = typeof activities.$inferInsert;

export const activityRepository = {
  async findAll() {
    return db.select().from(activities).orderBy(asc(activities.name));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));
    return rows[0] ?? null;
  },

  async findByName(name: string) {
    const rows = await db
      .select()
      .from(activities)
      .where(sql`lower(${activities.name}) = lower(${name})`)
      .limit(1);

    return rows[0] ?? null;
  },

  async create(data: ActivityInsert) {
    const rows = await db.insert(activities).values(data).returning();
    return rows[0]!;
  },
};
