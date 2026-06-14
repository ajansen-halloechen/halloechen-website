import { createError } from 'h3';
import type { ActivityCreate } from '#shared/types/activity';
import { activityRepository } from './activity.repository';

export const activityService = {
  async getAll() {
    return activityRepository.findAll();
  },

  async getById(id: string) {
    const activity = await activityRepository.findById(id);
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found',
      });
    }
    return activity;
  },

  async findOrCreate(input: ActivityCreate) {
    const normalizedName = input.name.trim();

    const existing = await activityRepository.findByName(normalizedName);
    if (existing) {
      return existing;
    }

    return activityRepository.create({ name: normalizedName });
  },
};
