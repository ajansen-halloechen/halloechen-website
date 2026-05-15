import type { ActivityCreate } from '#shared/types/activity';
import { activityRepository } from './activity.repository';

export const activityService = {
  async getAll() {
    return activityRepository.findAll();
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
