import { UserRole } from '#shared/types/user';
import type { ShiftAvailabilityUpsert } from '#shared/types/shift-availability';
import { ForbiddenError } from '#server/utils/domain-errors';
import { plannedShiftService } from '../planned-shift/planned-shift.service';
import { shiftAvailabilityRepository } from './shift-availability.repository';

export const shiftAvailabilityService = {
  async getByMonth(
    actor: { id: string; role: string },
    year: number,
    month: number,
    options?: { allUsers?: boolean },
  ) {
    const allUsers = options?.allUsers === true;
    if (allUsers && actor.role !== UserRole.admin) {
      throw new ForbiddenError('Admin access required to view all availabilities');
    }

    const shifts = await plannedShiftService.getByMonth(year, month);
    const shiftIds = shifts.map((s) => s.id);
    if (shiftIds.length === 0) return [];

    return shiftAvailabilityRepository.findByPlannedShiftIds(
      shiftIds,
      allUsers ? undefined : actor.id,
    );
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
