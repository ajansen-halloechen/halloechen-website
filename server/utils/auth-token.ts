import { createHash, randomUUID } from 'node:crypto';

export const SETUP_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function createAuthToken(ttlMs: number) {
  return {
    token: randomUUID(),
    expiresAt: new Date(Date.now() + ttlMs),
  };
}

export function hashAuthToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isAuthTokenExpired(expiresAt: Date | null): boolean {
  return !expiresAt || expiresAt.getTime() < Date.now();
}
