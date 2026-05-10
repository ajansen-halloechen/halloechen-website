import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: 'server/entities/**/*.table.ts',
  out: 'server/database/migrations',
  dbCredentials: {
    url: 'postgresql://postgres:postgres@localhost:5432/local',
  },
});
