import { createError } from 'h3';
import { workingHourRepository } from './working-hour.repository';
import { userRepository } from '../user/user.repository';
import { activityRepository } from '../activity/activity.repository';
import type {
  WorkingHourCreate,
  WorkingHourPatch,
} from '#shared/types/working-hour';

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

  async create(input: WorkingHourCreate) {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    const activity = await activityRepository.findById(input.activityId);
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found',
      });
    }

    return workingHourRepository.create(input);
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
      const activity = await activityRepository.findById(input.activityId);
      if (!activity) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Activity not found',
        });
      }
    }

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
