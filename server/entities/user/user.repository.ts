import { eq } from 'drizzle-orm';
import { db } from '#server/database';
import { users } from './user.table';
import type { NewUser } from '#shared/types/user';

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

  async create(data: NewUser) {
    const rows = await db.insert(users).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: Partial<NewUser>) {
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
