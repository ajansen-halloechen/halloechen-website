import {
  boolean,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../user/user.table';

export const shiftUserPreferences = pgTable(
  'shift_user_preferences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    maxBarShiftsPerMonth: integer('max_bar_shifts_per_month').notNull(),
    maxBarSupportShiftsPerMonth: integer(
      'max_bar_support_shifts_per_month',
    ).notNull(),
    maxCleaningShiftsPerMonth: integer(
      'max_cleaning_shifts_per_month',
    ).notNull(),
    shiftsOnConsecutiveDays: boolean('shifts_on_consecutive_days').notNull(),
    shiftsInConsecutiveWeeks: boolean('shifts_in_consecutive_weeks').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique('shift_user_preferences_user_unique').on(table.userId)],
);
