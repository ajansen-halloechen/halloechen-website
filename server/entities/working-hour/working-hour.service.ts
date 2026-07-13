import { createError } from 'h3';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';
import { workingHourRepository } from './working-hour.repository';
import { activityService } from '../activity/activity.service';
import type {
  WorkingHourCreate,
  WorkingHourPatch,
} from '#shared/types/working-hour';

function assertValidDateTimeRange(
  date: Date,
  startTime: string,
  endTime: string,
  plusOneDay: boolean,
) {
  const error = validateDateTimeRange(
    workingHourToDateTimeRange({ date, startTime, endTime, plusOneDay }),
  );

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: dateTimeRangeValidationMessage(error),
    });
  }
}

export const workingHourService = {
  async getAll(month?: { year: number; month: number }) {
    if (month) {
      return workingHourRepository.findByMonth(month.year, month.month);
    }
    return workingHourRepository.findAll();
  },

  async getById(id: string) {
    const workingHour = await workingHourRepository.findById(id);
    if (!workingHour) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Working hour not found',
      });
    }
    return workingHour;
  },

  async getByUserId(userId: string) {
    return workingHourRepository.findByUserId(userId);
  },

  async create(userId: string, input: WorkingHourCreate) {
    await activityService.getById(input.activityId);

    assertValidDateTimeRange(
      input.date,
      input.startTime,
      input.endTime,
      input.plusOneDay,
    );

    return workingHourRepository.create({ ...input, userId });
  },

  async patch(id: string, input: WorkingHourPatch, userId: string) {
    const existing = await workingHourRepository.findById(id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Working hour not found',
      });
    }

    if (existing.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only edit your own working hours',
      });
    }

    if (input.activityId) {
      await activityService.getById(input.activityId);
    }

    const date = input.date ?? existing.date;
    const startTime = input.startTime ?? existing.startTime;
    const endTime = input.endTime ?? existing.endTime;
    const plusOneDay = input.plusOneDay ?? existing.plusOneDay;

    assertValidDateTimeRange(date, startTime, endTime, plusOneDay);

    const workingHour = await workingHourRepository.update(id, input);
    return workingHour!;
  },

  async remove(id: string, userId: string) {
    const existing = await workingHourRepository.findById(id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Working hour not found',
      });
    }

    if (existing.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own working hours',
      });
    }

    const workingHour = await workingHourRepository.remove(id);
    return workingHour!;
  },
};
