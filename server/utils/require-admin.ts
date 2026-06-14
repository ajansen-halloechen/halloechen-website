import type { H3Event } from 'h3';
import { createError } from 'h3';
import { UserRole } from '#shared/types/user';

export function requireAdmin(event: H3Event) {
  const user = event.context.user;
  if (user?.role !== UserRole.admin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
}
