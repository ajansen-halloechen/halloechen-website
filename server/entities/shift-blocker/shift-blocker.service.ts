import { createError } from 'h3';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
} from '~~/shared/time-range-validation';
import { shiftBlockerRepository } from './shift-blocker.repository';
import type {
  ShiftBlockerCreate,
  ShiftBlockerPatch,
} from '#shared/types/shift-blocker';
import { UserRole } from '#shared/types/user';

function assertValidDateTimeRange(
  startDate: Date,
  startTime: string,
  endDate: Date,
  endTime: string,
) {
  const error = validateDateTimeRange({
    startDate,
    startTime,
    endDate,
    endTime,
  });

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: dateTimeRangeValidationMessage(error),
    });
  }
}

type Requester = {
  id: string;
  role: typeof UserRole.user | typeof UserRole.admin;
};

export const shiftBlockerService = {
  async getAll(
    requester: Requester,
    month: { year: number; month: number },
    options?: { allUsers?: boolean },
  ) {
    if (options?.allUsers) {
      if (requester.role !== UserRole.admin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
        });
      }

      return shiftBlockerRepository.findByMonth(month.year, month.month);
    }

    return shiftBlockerRepository.findByUserAndMonth(
      requester.id,
      month.year,
      month.month,
    );
  },

  async getById(id: string, userId: string) {
    const shiftBlocker = await shiftBlockerRepository.findById(id);
    if (!shiftBlocker) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Shift blocker not found',
      });
    }

    if (shiftBlocker.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only view your own shift blockers',
      });
    }

    return shiftBlocker;
  },

  async create(userId: string, input: ShiftBlockerCreate) {
    assertValidDateTimeRange(
      input.startDate,
      input.startTime,
      input.endDate,
      input.endTime,
    );

    return shiftBlockerRepository.create({ ...input, userId });
  },

  async patch(id: string, input: ShiftBlockerPatch, userId: string) {
    const existing = await shiftBlockerRepository.findById(id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Shift blocker not found',
      });
    }

    if (existing.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only edit your own shift blockers',
      });
    }

    const startDate = input.startDate ?? existing.startDate;
    const startTime = input.startTime ?? existing.startTime;
    const endDate = input.endDate ?? existing.endDate;
    const endTime = input.endTime ?? existing.endTime;

    assertValidDateTimeRange(startDate, startTime, endDate, endTime);

    const shiftBlocker = await shiftBlockerRepository.update(id, input);
    return shiftBlocker!;
  },

  async remove(id: string, userId: string) {
    const existing = await shiftBlockerRepository.findById(id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Shift blocker not found',
      });
    }

    if (existing.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own shift blockers',
      });
    }

    const shiftBlocker = await shiftBlockerRepository.remove(id);
    return shiftBlocker!;
  },
};
