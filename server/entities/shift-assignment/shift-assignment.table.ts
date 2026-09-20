import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user/user.table';
import { plannedShifts } from '../planned-shift/planned-shift.table';

export const shiftAssignments = pgTable(
  'shift_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    plannedShiftId: uuid('planned_shift_id')
      .notNull()
      .references(() => plannedShifts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('shift_assignments_shift_user_unique').on(
      table.plannedShiftId,
      table.userId,
    ),
  ],
);
