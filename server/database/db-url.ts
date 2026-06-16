export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  const user = encodeURIComponent(process.env.DB_USER ?? 'postgres');
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? 'postgres');
  const database = process.env.DB_NAME ?? 'local';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
