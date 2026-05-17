import { userRepository } from '#server/entities/user/user.repository';

async function addUserIfNotExists(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  role: 'user' | 'admin' = 'user',
): Promise<void> {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(password);
  await userRepository.create({
    email,
    firstName,
    lastName,
    passwordHash,
    role,
  });
  console.log(`Seeded test user: ${email} / ${password} (${role})`);
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
