import { UserRole } from '#shared/types/user';
import type { AvailabilityStatus } from '#shared/types/shift-availability';
import type {
  ShiftAssignmentPlanMode,
  ShiftAssignmentReplace,
} from '#shared/types/shift-assignment';
import type { ShiftType } from '#shared/types/shift-type';
import {
  ForbiddenError,
  ValidationError,
} from '#server/utils/domain-errors';
import {
  AvailabilityStatusProto,
  planShifts,
  ShiftTypeProto,
} from '#server/utils/planner-client';
import { plannedShiftService } from '../planned-shift/planned-shift.service';
import { shiftAvailabilityService } from '../shift-availability/shift-availability.service';
import { shiftUserPreferenceService } from '../shift-user-preference/shift-user-preference.service';
import { db } from '#server/database';
import { shiftAssignmentRepository } from './shift-assignment.repository';

function assertAdmin(role: string) {
  if (role !== UserRole.admin) {
    throw new ForbiddenError('Admin access required');
  }
}

function toIsoDateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toProtoAvailabilityStatus(status: AvailabilityStatus): number {
  switch (status) {
    case 'available':
      return AvailabilityStatusProto.AVAILABLE;
    case 'preference':
      return AvailabilityStatusProto.PREFERENCE;
    case 'unavailable':
      return AvailabilityStatusProto.UNAVAILABLE;
  }
}

function toProtoShiftType(type: ShiftType): number {
  switch (type) {
    case 'bar':
      return ShiftTypeProto.BAR;
    case 'cleaning':
      return ShiftTypeProto.CLEANING;
    case 'bar-support':
      return ShiftTypeProto.BAR_SUPPORT;
  }
}

export const shiftAssignmentService = {
  async getByMonth(year: number, month: number) {
    const shifts = await plannedShiftService.getByMonth(year, month);
    const shiftIds = shifts.map((s) => s.id);
    return shiftAssignmentRepository.findByPlannedShiftIds(shiftIds);
  },

  async planMonth(
    actor: { id: string; role: string },
    year: number,
    month: number,
    mode: ShiftAssignmentPlanMode = 'replace',
  ) {
    assertAdmin(actor.role);

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const shifts = await plannedShiftService.getByMonth(year, month);
    if (shifts.length === 0) {
      throw new ValidationError('Keine Schichten in diesem Monat.');
    }

    const existingAssignments =
      mode === 'fill'
        ? await shiftAssignmentRepository.findByPlannedShiftIds(
            shifts.map((s) => s.id),
          )
        : [];

    if (mode === 'fill') {
      const assignedByShift = new Map<string, number>();
      for (const assignment of existingAssignments) {
        assignedByShift.set(
          assignment.plannedShiftId,
          (assignedByShift.get(assignment.plannedShiftId) ?? 0) + 1,
        );
      }
      const hasOpenSlots = shifts.some(
        (shift) =>
          (assignedByShift.get(shift.id) ?? 0) < shift.numberOfPersons,
      );
      if (!hasOpenSlots) {
        return {
          assignments: existingAssignments.map((assignment) => ({
            plannedShiftId: assignment.plannedShiftId,
            userId: assignment.userId,
          })),
        };
      }
    }

    const availabilities = await shiftAvailabilityService.getByMonth(
      actor,
      year,
      month,
      { allUsers: true },
    );

    const userIds = [
      ...new Set([
        ...availabilities.map((a) => a.userId),
        ...existingAssignments.map((a) => a.userId),
      ]),
    ];
    const userPreferences =
      await shiftUserPreferenceService.getForUsers(userIds);

    const assignments = await planShifts({
      month: monthStr,
      plannedShifts: shifts.map((shift) => ({
        id: shift.id,
        date: toIsoDateString(shift.date),
        numberOfPersons: shift.numberOfPersons,
        type: toProtoShiftType(shift.type),
      })),
      availabilities: availabilities.map((availability) => ({
        userId: availability.userId,
        plannedShiftId: availability.plannedShiftId,
        status: toProtoAvailabilityStatus(availability.status),
      })),
      userPreferences: userPreferences.map((pref) => ({
        userId: pref.userId,
        maxBarShiftsPerMonth: pref.maxBarShiftsPerMonth,
        maxBarSupportShiftsPerMonth: pref.maxBarSupportShiftsPerMonth,
        maxCleaningShiftsPerMonth: pref.maxCleaningShiftsPerMonth,
        shiftsOnConsecutiveDays: pref.shiftsOnConsecutiveDays,
        shiftsInConsecutiveWeeks: pref.shiftsInConsecutiveWeeks,
      })),
      fixedAssignments: existingAssignments.map((assignment) => ({
        plannedShiftId: assignment.plannedShiftId,
        userId: assignment.userId,
      })),
    });

    return { assignments };
  },

  async replaceForMonth(role: string, input: ShiftAssignmentReplace) {
    assertAdmin(role);

    const match = input.month.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new ValidationError('Invalid month format. Expected YYYY-MM.');
    }
    const year = Number(match[1]);
    const month = Number(match[2]);

    const shifts = await plannedShiftService.getByMonth(year, month);
    const shiftIds = shifts.map((s) => s.id);
    const shiftIdSet = new Set(shiftIds);

    for (const assignment of input.assignments) {
      if (!shiftIdSet.has(assignment.plannedShiftId)) {
        throw new ValidationError(
          'Assignment refers to a planned shift outside the given month.',
        );
      }
    }

    return db.transaction(async (tx) => {
      await shiftAssignmentRepository.deleteByPlannedShiftIds(shiftIds, tx);
      return shiftAssignmentRepository.createMany(
        input.assignments.map((assignment) => ({
          plannedShiftId: assignment.plannedShiftId,
          userId: assignment.userId,
        })),
        tx,
      );
    });
  },
};
