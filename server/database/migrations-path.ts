import { join } from 'node:path';

export function getMigrationsFolder(): string {
  return join(process.cwd(), 'server/database/migrations');
}
