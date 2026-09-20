import type {
  ResolvedShiftUserPreference,
  ShiftUserPreferenceUpsert,
} from '#shared/types/shift-user-preference';
import {
  DEFAULT_MAX_SHIFTS_PER_MONTH,
  DEFAULT_SHIFTS_IN_CONSECUTIVE_WEEKS,
  DEFAULT_SHIFTS_ON_CONSECUTIVE_DAYS,
} from './shift-user-preference.schema';
import { shiftUserPreferenceRepository } from './shift-user-preference.repository';

function defaultPreference(userId: string): ResolvedShiftUserPreference {
  return {
    userId,
    maxShiftsPerMonth: DEFAULT_MAX_SHIFTS_PER_MONTH,
    shiftsOnConsecutiveDays: DEFAULT_SHIFTS_ON_CONSECUTIVE_DAYS,
    shiftsInConsecutiveWeeks: DEFAULT_SHIFTS_IN_CONSECUTIVE_WEEKS,
  };
}

export const shiftUserPreferenceService = {
  async getForUser(userId: string): Promise<ResolvedShiftUserPreference> {
    const stored = await shiftUserPreferenceRepository.findByUserId(userId);
    if (!stored) return defaultPreference(userId);
    return stored;
  },

  async getForUsers(
    userIds: string[],
  ): Promise<ResolvedShiftUserPreference[]> {
    const stored = await shiftUserPreferenceRepository.findByUserIds(userIds);
    const byUserId = new Map(stored.map((pref) => [pref.userId, pref]));

    return userIds.map(
      (userId) => byUserId.get(userId) ?? defaultPreference(userId),
    );
  },

  async upsert(userId: string, input: ShiftUserPreferenceUpsert) {
    const existing = await shiftUserPreferenceRepository.findByUserId(userId);

    if (existing) {
      const updated = await shiftUserPreferenceRepository.update(existing.id, {
        maxShiftsPerMonth: input.maxShiftsPerMonth,
        shiftsOnConsecutiveDays: input.shiftsOnConsecutiveDays,
        shiftsInConsecutiveWeeks: input.shiftsInConsecutiveWeeks,
      });
      return updated!;
    }

    return shiftUserPreferenceRepository.create({
      userId,
      maxShiftsPerMonth: input.maxShiftsPerMonth,
      shiftsOnConsecutiveDays: input.shiftsOnConsecutiveDays,
      shiftsInConsecutiveWeeks: input.shiftsInConsecutiveWeeks,
    });
  },
};
