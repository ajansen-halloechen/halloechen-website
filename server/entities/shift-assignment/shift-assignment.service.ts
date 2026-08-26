import { plannedShiftService } from '../planned-shift/planned-shift.service';
import { shiftAssignmentRepository } from './shift-assignment.repository';

export const shiftAssignmentService = {
  async getByMonth(year: number, month: number) {
    const shifts = await plannedShiftService.getByMonth(year, month);
    const shiftIds = shifts.map((s) => s.id);
    return shiftAssignmentRepository.findByPlannedShiftIds(shiftIds);
  },
};
