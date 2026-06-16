import { defineConfig } from 'drizzle-kit';
import { getDatabaseUrl } from './server/database/db-url';

export default defineConfig({
  dialect: 'postgresql',
  schema: 'server/entities/**/*.table.ts',
  out: 'server/database/migrations',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
