import { createError } from 'h3';
import { userRepository } from './user.repository';
import type { UserCreate, UserUpdate } from '#shared/types/user';

export const userService = {
  async getAll() {
    return userRepository.findAll();
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return user;
  },

  async create(input: UserCreate) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this email already exists',
      });
    }
    return userRepository.create(input);
  },

  async update(id: string, input: UserUpdate) {
    if (input.email) {
      const existing = await userRepository.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw createError({
          statusCode: 409,
          statusMessage: 'A user with this email already exists',
        });
      }
    }

    const user = await userRepository.update(id, input);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return user;
  },

  async remove(id: string) {
    const user = await userRepository.remove(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return user;
  },
};
