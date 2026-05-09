import { eq } from 'drizzle-orm';
import { db } from '#server/database';
import { users } from './user.table';

type UserInsert = typeof users.$inferInsert;
type UserColumns = typeof users.$inferSelect;

export const userRepository = {
  async findAll() {
    return db.select().from(users);
  },

  async findById(id: string) {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] ?? null;
  },

  async findByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] ?? null;
  },

  async findBySetupToken(token: string) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.setupToken, token));
    return rows[0] ?? null;
  },

  async create(data: UserInsert) {
    const rows = await db.insert(users).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: Partial<UserColumns>) {
    const rows = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string) {
    const rows = await db.delete(users).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },
};
