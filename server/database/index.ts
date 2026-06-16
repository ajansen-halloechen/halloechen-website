import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { getDatabaseUrl } from './db-url';

const pool = new pg.Pool({ connectionString: getDatabaseUrl() });

export const db = drizzle(pool);
