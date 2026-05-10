import { userRepository } from '#server/entities/user/user.repository';

export default defineNitroPlugin(async () => {
  const email: string = 'test@halloechen.org';
  const existing = await userRepository.findByEmail(email);

  if (existing) {
    return;
  }

  const passwordHash: string = await hashPassword('test1234');
  await userRepository.create({
    email,
    firstName: 'Test',
    lastName: 'User',
    passwordHash,
  });

  console.log(`Seeded test user: ${email} / test1234`);
});
