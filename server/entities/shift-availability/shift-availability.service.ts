import { UserRole } from '#shared/types/user';
import type {
  ResolvedShiftAvailability,
  ShiftAvailabilityUpsert,
} from '#shared/types/shift-availability';
import { ForbiddenError } from '#server/utils/domain-errors';
import { plannedShiftService } from '../planned-shift/planned-shift.service';
import { userService } from '../user/user.service';
import { DEFAULT_AVAILABILITY_STATUS } from './shift-availability.schema';
import { shiftAvailabilityRepository } from './shift-availability.repository';

function defaultAvailability(
  userId: string,
  plannedShiftId: string,
): ResolvedShiftAvailability {
  return {
    userId,
    plannedShiftId,
    status: DEFAULT_AVAILABILITY_STATUS,
  };
}

function resolveAvailabilities(
  userIds: string[],
  shiftIds: string[],
  stored: ResolvedShiftAvailability[],
): ResolvedShiftAvailability[] {
  const byPair = new Map(
    stored.map((availability) => [
      `${availability.userId}:${availability.plannedShiftId}`,
      availability,
    ]),
  );

  const resolved: ResolvedShiftAvailability[] = [];
  for (const userId of userIds) {
    for (const shiftId of shiftIds) {
      resolved.push(
        byPair.get(`${userId}:${shiftId}`) ??
          defaultAvailability(userId, shiftId),
      );
    }
  }
  return resolved;
}

export const shiftAvailabilityService = {
  async getByMonth(
    actor: { id: string; role: string },
    year: number,
    month: number,
    options?: { allUsers?: boolean },
  ): Promise<ResolvedShiftAvailability[]> {
    const allUsers = options?.allUsers === true;
    if (allUsers && actor.role !== UserRole.admin) {
      throw new ForbiddenError('Admin access required to view all availabilities');
    }

    const shifts = await plannedShiftService.getByMonth(year, month);
    const shiftIds = shifts.map((s) => s.id);
    if (shiftIds.length === 0) return [];

    const stored = await shiftAvailabilityRepository.findByPlannedShiftIds(
      shiftIds,
      allUsers ? undefined : actor.id,
    );

    const userIds = allUsers
      ? (await userService.getAll()).map((user) => user.id)
      : [actor.id];

    return resolveAvailabilities(userIds, shiftIds, stored);
  },

  async upsert(userId: string, input: ShiftAvailabilityUpsert) {
    await plannedShiftService.getById(input.plannedShiftId);

    const existing = await shiftAvailabilityRepository.findByUserAndShift(
      userId,
      input.plannedShiftId,
    );

    if (existing) {
      const updated = await shiftAvailabilityRepository.update(existing.id, {
        status: input.status,
      });
      return updated!;
    }

    return shiftAvailabilityRepository.create({
      userId,
      plannedShiftId: input.plannedShiftId,
      status: input.status,
    });
  },
};
