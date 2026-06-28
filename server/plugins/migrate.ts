import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '#server/database';
import { getMigrationsFolder } from '#server/database/migrations-path';
import { userService } from '../entities/user/user.service';
import { randomUUID } from 'node:crypto';

async function addUserIfNotExists(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  role: 'user' | 'admin' = 'user',
): Promise<void> {
  const created = await userService.seedIfNotExists(
    email,
    firstName,
    lastName,
    password,
    role,
  );

  if (created) {
    console.log(`Seeded user: ${email} / ${password} (${role})`);
  }
}

export default defineNitroPlugin(async () => {
  console.log('Starting database migration.');
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await migrate(db, { migrationsFolder: getMigrationsFolder() });
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.log('Database not ready, retrying migrations in 2s...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.log('Finished database migration successfully.');

  await addUserIfNotExists(
    'info@halloechen.org',
    'Admin',
    'User',
    randomUUID(),
    'admin',
  );
});
