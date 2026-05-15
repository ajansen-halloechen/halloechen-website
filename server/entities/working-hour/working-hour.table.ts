import {
  boolean,
  date,
  pgTable,
  real,
  time,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../user/user.table';
import { activities } from '../activity/activity.table';

export const workingHours = pgTable('working_hours', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  activityId: uuid('activity_id')
    .notNull()
    .references(() => activities.id),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  breakInHours: real('break_in_hours').notNull().default(0),
  plusOneDay: boolean('plus_one_day').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
