import { randomUUID } from 'node:crypto';
import { createError } from 'h3';
import { userRepository } from './user.repository';
import type { UserCreate, UserSetup, UserPatch } from '#shared/types/user';

function stripPasswordHash<T extends { passwordHash?: unknown }>(
  user: T,
): Omit<T, 'passwordHash'> {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export const userService = {
  async getAll() {
    const users = await userRepository.findAll();
    return users.map(stripPasswordHash);
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return stripPasswordHash(user);
  },

  async create(input: UserCreate) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this email already exists',
      });
    }

    const setupToken = randomUUID();
    const setupTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await userRepository.create({
      email: input.email,
      role: input.role,
      setupToken,
      setupTokenExpiresAt,
    });

    return stripPasswordHash(user);
  },

  async setup(input: UserSetup) {
    const user = await userRepository.findBySetupToken(input.token);
    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid setup token',
      });
    }

    if (
      user.setupTokenExpiresAt &&
      user.setupTokenExpiresAt.getTime() < Date.now()
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Setup token has expired',
      });
    }

    const passwordHash = await hashPassword(input.password);

    const updated = await userRepository.update(user.id, {
      passwordHash,
      firstName: input.firstName ?? user.firstName,
      lastName: input.lastName ?? user.lastName,
      setupToken: null,
      setupTokenExpiresAt: null,
    });

    return stripPasswordHash(updated!);
  },

  async patch(id: string, input: UserPatch) {
    const { password, oldPassword, ...fields } = input;

    if (fields.email) {
      const existing = await userRepository.findByEmail(fields.email);
      if (existing && existing.id !== id) {
        throw createError({
          statusCode: 409,
          statusMessage: 'A user with this email already exists',
        });
      }
    }

    const data: Record<string, unknown> = { ...fields };
    if (password) {
      const current = await userRepository.findById(id);
      if (!current || !current.passwordHash) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User has no password set',
        });
      }

      const valid = await verifyPassword(current.passwordHash, oldPassword!);
      if (!valid) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Old password is incorrect',
        });
      }

      data.passwordHash = await hashPassword(password);
    }

    const user = await userRepository.update(id, data);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return stripPasswordHash(user);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password',
      });
    }

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password',
      });
    }

    return stripPasswordHash(user);
  },

  async remove(id: string) {
    const user = await userRepository.remove(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return stripPasswordHash(user);
  },
};
