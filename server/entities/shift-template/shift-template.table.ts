import {
  boolean,
  integer,
  pgTable,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const shiftTemplates = pgTable('shift_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** ISO weekday: 1 = Monday … 7 = Sunday */
  weekday: integer('weekday').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  plusOneDay: boolean('plus_one_day').notNull().default(false),
  comment: varchar('comment', { length: 255 }),
  numberOfPersons: integer('number_of_persons').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
