import { join } from 'node:path';

/** Runtime env — read when the server starts, not at Docker/Nuxt build time. */
export function getSiteEnv(): string {
  return process.env.NUXT_SITE_ENV ?? 'development';
}

export function getPublicSiteUrl(): string {
  const url = process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return url.replace(/\/$/, '');
}

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Individual vars — read at runtime (see server/utils/env.ts for the same pattern).
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  const user = encodeURIComponent(process.env.DB_USER ?? 'postgres');
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? 'postgres');
  const database = process.env.DB_NAME ?? 'local';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

export function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
    from: process.env.MAIL_FROM ?? 'info@halloechen.org',
  };
}

export function getFilesStoragePath(): string {
  return process.env.FILES_STORAGE_PATH ?? join(process.cwd(), 'files');
}

export function getCalendarFeedToken(): string | undefined {
  const token = process.env.CALENDAR_FEED_TOKEN;
  return token && token.length > 0 ? token : undefined;
}
