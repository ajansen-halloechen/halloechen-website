import { defineConfig } from 'drizzle-kit';
import { getDatabaseUrl } from './server/utils/env';

export default defineConfig({
  dialect: 'postgresql',
  schema: 'server/entities/**/*.table.ts',
  out: 'server/database/migrations',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
