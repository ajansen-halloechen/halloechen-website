declare module '#auth-utils' {
  interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
  }
}

export {};
