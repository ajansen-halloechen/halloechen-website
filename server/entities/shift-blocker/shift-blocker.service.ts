import { createError } from 'h3';
import { shiftBlockerRepository } from './shift-blocker.repository';
import type {
  ShiftBlockerCreate,
  ShiftBlockerPatch,
} from '#shared/types/shift-blocker';

function toDateTime(date: Date, time: string): Date {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, seconds, 0);
  return result;
}

function assertValidDateTimeRange(
  startDate: Date,
  startTime: string,
  endDate: Date,
  endTime: string,
) {
  const start = toDateTime(startDate, startTime);
  const end = toDateTime(endDate, endTime);

  if (end <= start) {
    throw createError({
      statusCode: 400,
      statusMessage: 'End date and time must be after start date and time',
    });
  }
}

export const shiftBlockerService = {
  async getAllForUser(userId: string, month?: { year: number; month: number }) {
    if (month) {
      return shiftBlockerRepository.findByUserAndMonth(
        userId,
        month.year,
        month.month,
      );
    }

    throw createError({
      statusCode: 400,
      statusMessage: 'Month parameter is required. Expected YYYY-MM.',
    });
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
