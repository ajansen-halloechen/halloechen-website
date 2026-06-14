import { pgEnum, pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 50 }),
  role: userRoleEnum('role').default('user').notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  setupToken: varchar('setup_token', { length: 255 }).unique(),
  setupTokenExpiresAt: timestamp('setup_token_expires_at', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
