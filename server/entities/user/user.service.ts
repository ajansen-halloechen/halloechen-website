import { createError } from 'h3';
import { sendInvitationEmail } from '#server/mail/invitation.mail';
import { sendPasswordResetEmail } from '#server/mail/password-reset.mail';
import {
  createAuthToken,
  hashAuthToken,
  isAuthTokenExpired,
  PASSWORD_RESET_TOKEN_TTL_MS,
  SETUP_TOKEN_TTL_MS,
} from '#server/utils/auth-token';
import { deliverMail } from '#server/utils/deliver-mail';
import { toPublicUser } from './user.schema';
import { userRepository } from './user.repository';
import type {
  PasswordResetConfirm,
  UserCreate,
  UserPatch,
  UserSetup,
} from '#shared/types/user';

function createSetupToken() {
  const { token, expiresAt } = createAuthToken(SETUP_TOKEN_TTL_MS);
  return {
    plainToken: token,
    setupToken: hashAuthToken(token),
    setupTokenExpiresAt: expiresAt,
  };
}

async function deliverInvitation(email: string, token: string) {
  await deliverMail(
    () => sendInvitationEmail(email, token),
    'Failed to send invitation email',
  );
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

  async getByIdInternal(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    return user;
  },

  async setAvatar(id: string, avatar: string | null) {
    const user = await userRepository.update(id, { avatar });
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

    const { plainToken, setupToken, setupTokenExpiresAt } = createSetupToken();

    const user = await userRepository.create({
      email: input.email,
      role: input.role,
      setupToken,
      setupTokenExpiresAt,
    });

    await deliverInvitation(user.email, plainToken);

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

    const { plainToken, setupToken, setupTokenExpiresAt } = createSetupToken();

    const updated = await userRepository.update(id, {
      setupToken,
      setupTokenExpiresAt,
    });

    await deliverInvitation(user.email, plainToken);

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

    if (isAuthTokenExpired(user.setupTokenExpiresAt)) {
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

  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      return;
    }

    const { token, expiresAt } = createAuthToken(PASSWORD_RESET_TOKEN_TTL_MS);

    await userRepository.update(user.id, {
      passwordResetToken: hashAuthToken(token),
      passwordResetTokenExpiresAt: expiresAt,
    });

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (error) {
      console.error(
        `[mail] Failed to send password reset email to ${user.email}:`,
        error,
      );
    }
  },

  async resetPassword(input: PasswordResetConfirm) {
    const user = await userRepository.findByPasswordResetToken(input.token);
    if (!user || isAuthTokenExpired(user.passwordResetTokenExpiresAt)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token',
      });
    }

    const passwordHash = await hashPassword(input.password);

    const updated = await userRepository.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
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
