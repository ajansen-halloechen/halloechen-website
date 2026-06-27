import { userService } from '#server/entities/user/user.service';
import { randomUUID } from 'node:crypto';

async function addUserIfNotExists(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  role: 'user' | 'admin' = 'user',
): Promise<void> {
  const created = await userService.seedIfNotExists(
    email,
    firstName,
    lastName,
    password,
    role,
  );
  if (created) {
    console.log(`Seeded test user: ${email} / ${password} (${role})`);
  }
}

export default defineNitroPlugin(async () => {
  const password = randomUUID();

  await addUserIfNotExists(
    'test@halloechen.org',
    'Test',
    'User',
    password,
    'admin',
  );

  console.log(`[init] Generated new admin user with password: ${password}`);
});
