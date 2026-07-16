import {
  date,
  pgTable,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../user/user.table';

export const shiftBlockers = pgTable('shift_blockers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  startDate: date('start_date', { mode: 'date' }).notNull(),
  startTime: time('start_time').notNull(),
  endDate: date('end_date', { mode: 'date' }).notNull(),
  endTime: time('end_time').notNull(),
  description: varchar('description', { length: 500 }).notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
