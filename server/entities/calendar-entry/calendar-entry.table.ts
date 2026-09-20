import {
  date,
  pgEnum,
  pgTable,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../user/user.table';

export const calendarEntryTypeEnum = pgEnum('calendar_entry_type', [
  'publicEvent',
  'internalEvent',
  'reservation',
]);

export const calendarEntries = pgTable('calendar_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 2000 }).notNull().default(''),
  startDate: date('start_date', { mode: 'date' }).notNull(),
  startTime: time('start_time').notNull(),
  endDate: date('end_date', { mode: 'date' }).notNull(),
  endTime: time('end_time').notNull(),
  type: calendarEntryTypeEnum('type').notNull(),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
