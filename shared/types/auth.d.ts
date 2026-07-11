import type { UserRole } from '#shared/types/user';

declare module '#auth-utils' {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    avatar: string | null;
    sessionVersion: number;
  }
}

export {};
