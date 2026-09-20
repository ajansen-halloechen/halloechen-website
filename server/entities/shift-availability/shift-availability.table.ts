import {
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../user/user.table';
import { plannedShifts } from '../planned-shift/planned-shift.table';

export const availabilityStatusEnum = pgEnum('availability_status', [
  'available',
  'preference',
  'unavailable',
]);

export const shiftAvailabilities = pgTable(
  'shift_availabilities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plannedShiftId: uuid('planned_shift_id')
      .notNull()
      .references(() => plannedShifts.id, { onDelete: 'cascade' }),
    status: availabilityStatusEnum('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('shift_availabilities_user_shift_unique').on(
      table.userId,
      table.plannedShiftId,
    ),
  ],
);
