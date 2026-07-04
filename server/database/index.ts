import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { getDatabaseUrl } from '#server/utils/env';

const pool = new pg.Pool({ connectionString: getDatabaseUrl() });

export const db = drizzle(pool);
