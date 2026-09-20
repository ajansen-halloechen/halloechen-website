import {
  boolean,
  date,
  integer,
  pgTable,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { shiftTemplates } from '../shift-template/shift-template.table';

export const plannedShifts = pgTable('planned_shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: date('date', { mode: 'date' }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  plusOneDay: boolean('plus_one_day').notNull().default(false),
  comment: varchar('comment', { length: 255 }),
  numberOfPersons: integer('number_of_persons').notNull(),
  templateId: uuid('template_id').references(() => shiftTemplates.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
