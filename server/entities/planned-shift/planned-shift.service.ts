import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';
import { UserRole } from '#shared/types/user';
import type { PlannedShiftCreate } from '#shared/types/planned-shift';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '#server/utils/domain-errors';
import { shiftTemplateService } from '../shift-template/shift-template.service';
import { plannedShiftRepository } from './planned-shift.repository';

function assertAdmin(role: string) {
  if (role !== UserRole.admin) {
    throw new ForbiddenError('Admin access required');
  }
}

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
    throw new ValidationError(dateTimeRangeValidationMessage(error));
  }
}

/** JS getDay(): 0=Sun … 6=Sat → ISO: 1=Mon … 7=Sun */
function toIsoWeekday(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

function eachDayOfMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const cursor = new Date(Date.UTC(year, month - 1, 1));
  while (cursor.getUTCMonth() === month - 1) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export const plannedShiftService = {
  async getByMonth(year: number, month: number) {
    return plannedShiftRepository.findByMonth(year, month);
  },

  async getById(id: string) {
    const shift = await plannedShiftRepository.findById(id);
    if (!shift) {
      throw new NotFoundError('Planned shift not found');
    }
    return shift;
  },

  async create(role: string, input: PlannedShiftCreate) {
    assertAdmin(role);
    assertValidDateTimeRange(
      input.date,
      input.startTime,
      input.endTime,
      input.plusOneDay,
    );

    return plannedShiftRepository.create({
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      plusOneDay: input.plusOneDay,
      comment: input.comment ?? null,
      numberOfPersons: input.numberOfPersons,
      templateId: input.templateId ?? null,
    });
  },

  async importFromTemplates(role: string, year: number, month: number) {
    assertAdmin(role);

    const templates = await shiftTemplateService.getAll();
    const days = eachDayOfMonth(year, month);
    const created = [];

    for (const template of templates) {
      for (const day of days) {
        if (toIsoWeekday(day) !== template.weekday) continue;

        const existing = await plannedShiftRepository.findByTemplateAndDate(
          template.id,
          day,
        );
        if (existing) continue;

        const shift = await plannedShiftRepository.create({
          date: day,
          startTime: template.startTime,
          endTime: template.endTime,
          plusOneDay: template.plusOneDay,
          comment: template.comment,
          numberOfPersons: template.numberOfPersons,
          templateId: template.id,
        });
        created.push(shift);
      }
    }

    return created;
  },

  async remove(role: string, id: string) {
    assertAdmin(role);
    const existing = await plannedShiftRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Planned shift not found');
    }
    const removed = await plannedShiftRepository.remove(id);
    return removed!;
  },
};
