import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '#server/database';
import { getMigrationsFolder } from '#server/database/migrations-path';

export default defineNitroPlugin(async () => {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await migrate(db, { migrationsFolder: getMigrationsFolder() });
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.log('Database not ready, retrying migrations in 2s...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
});
