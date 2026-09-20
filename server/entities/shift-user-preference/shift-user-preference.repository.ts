import { eq, inArray } from 'drizzle-orm';
import { db } from '#server/database';
import { shiftUserPreferences } from './shift-user-preference.table';

type ShiftUserPreferenceInsert = typeof shiftUserPreferences.$inferInsert;
type ShiftUserPreferenceUpdate = Pick<
  ShiftUserPreferenceInsert,
  | 'maxShiftsPerMonth'
  | 'shiftsOnConsecutiveDays'
  | 'shiftsInConsecutiveWeeks'
>;

export const shiftUserPreferenceRepository = {
  async findByUserId(userId: string) {
    const rows = await db
      .select()
      .from(shiftUserPreferences)
      .where(eq(shiftUserPreferences.userId, userId));
    return rows[0] ?? null;
  },

  async findByUserIds(userIds: string[]) {
    if (userIds.length === 0) return [];

    return db
      .select()
      .from(shiftUserPreferences)
      .where(inArray(shiftUserPreferences.userId, userIds));
  },

  async create(data: ShiftUserPreferenceInsert) {
    const rows = await db.insert(shiftUserPreferences).values(data).returning();
    return rows[0]!;
  },

  async update(id: string, data: ShiftUserPreferenceUpdate) {
    const rows = await db
      .update(shiftUserPreferences)
      .set(data)
      .where(eq(shiftUserPreferences.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
