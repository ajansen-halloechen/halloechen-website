import { randomUUID } from 'node:crypto';
import { createError } from 'h3';
import { sendInvitationEmail } from '#server/mail/invitation.mail';
import { toPublicUser } from './user.schema';
import { userRepository } from './user.repository';
import type { UserCreate, UserSetup, UserPatch } from '#shared/types/user';

const SETUP_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createSetupToken() {
  return {
    setupToken: randomUUID(),
    setupTokenExpiresAt: new Date(Date.now() + SETUP_TOKEN_TTL_MS),
  };
}

async function deliverInvitation(email: string, token: string) {
  try {
    await sendInvitationEmail(email, token);
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to send invitation email',
    });
  }
}

export const userService = {
  async getAll() {
    const users = await userRepository.findAll();
    return users.map(toPublicUser);
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return toPublicUser(user);
  },

  async create(input: UserCreate) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this email already exists',
      });
    }

    const { setupToken, setupTokenExpiresAt } = createSetupToken();

    const user = await userRepository.create({
      email: input.email,
      role: input.role,
      setupToken,
      setupTokenExpiresAt,
    });

    await deliverInvitation(user.email, setupToken);

    return toPublicUser(user);
  },

  async resendInvitation(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    if (user.passwordHash) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is already registered',
      });
    }

    const { setupToken, setupTokenExpiresAt } = createSetupToken();

    const updated = await userRepository.update(id, {
      setupToken,
      setupTokenExpiresAt,
    });

    await deliverInvitation(user.email, setupToken);

    return toPublicUser(updated!);
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
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      setupToken: null,
      setupTokenExpiresAt: null,
    });

    return toPublicUser(updated!);
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
    return toPublicUser(user);
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

    return toPublicUser(user);
  },

  async remove(id: string) {
    const user = await userRepository.remove(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return toPublicUser(user);
  },

  async seedIfNotExists(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    role: 'user' | 'admin' = 'user',
  ): Promise<boolean> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return false;
    }

    const passwordHash = await hashPassword(password);
    await userRepository.create({
      email,
      firstName,
      lastName,
      passwordHash,
      role,
    });
    return true;
  },
};
