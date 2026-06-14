import { userService } from '#server/entities/user/user.service';

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
  await addUserIfNotExists(
    'test@halloechen.org',
    'Test',
    'User',
    'test1234',
    'admin',
  );
  await addUserIfNotExists('test2@halloechen.org', 'Test2', 'User', 'password');
});
