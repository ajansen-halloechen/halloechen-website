import { eq, sql } from 'drizzle-orm';
import { db } from '#server/database';
import { hashAuthToken } from '#server/utils/auth-token';
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
      .where(eq(users.setupToken, hashAuthToken(token)));
    return rows[0] ?? null;
  },

  async findByPasswordResetToken(token: string) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, hashAuthToken(token)));
    return rows[0] ?? null;
  },

  async findSessionMetaById(id: string) {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        sessionVersion: users.sessionVersion,
      })
      .from(users)
      .where(eq(users.id, id));
    return rows[0] ?? null;
  },

  async create(data: UserInsert) {
    const rows = await db.insert(users).values(data).returning();
    return rows[0]!;
  },

  async update(
    id: string,
    data: Partial<UserColumns>,
    options?: { bumpSessionVersion?: boolean },
  ) {
    const rows = await db
      .update(users)
      .set(
        options?.bumpSessionVersion
          ? { ...data, sessionVersion: sql`${users.sessionVersion} + 1` }
          : data,
      )
      .where(eq(users.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string) {
    const rows = await db.delete(users).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },
};
