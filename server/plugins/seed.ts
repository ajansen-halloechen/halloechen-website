import { userRepository } from '#server/entities/user/user.repository';
import { a } from 'vue-router/dist/index-D_VEAp3P.js';

async function addUserIfNotExists(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
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
  });
  console.log(`Seeded test user: ${email} / ${password}`);
}

export default defineNitroPlugin(async () => {
  await addUserIfNotExists('test@halloechen.org', 'Test', 'User', 'test1234');
  await addUserIfNotExists('test2@halloechen.org', 'Test2', 'User', 'password');
});
