import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
  workingHourToDateTimeRange,
} from '~~/shared/time-range-validation';
import { UserRole } from '#shared/types/user';
import type {
  ShiftTemplateCreate,
  ShiftTemplatePatch,
} from '#shared/types/shift-template';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '#server/utils/domain-errors';
import { shiftTemplateRepository } from './shift-template.repository';

function assertAdmin(role: string) {
  if (role !== UserRole.admin) {
    throw new ForbiddenError('Admin access required');
  }
}

function assertValidTimeRange(
  startTime: string,
  endTime: string,
  plusOneDay: boolean,
) {
  const error = validateDateTimeRange(
    workingHourToDateTimeRange({
      date: '2000-01-03',
      startTime,
      endTime,
      plusOneDay,
    }),
  );
  if (error) {
    throw new ValidationError(dateTimeRangeValidationMessage(error));
  }
}

export const shiftTemplateService = {
  async getAll() {
    return shiftTemplateRepository.findAll();
  },

  async getById(id: string) {
    const template = await shiftTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundError('Shift template not found');
    }
    return template;
  },

  async create(role: string, input: ShiftTemplateCreate) {
    assertAdmin(role);
    assertValidTimeRange(input.startTime, input.endTime, input.plusOneDay);
    return shiftTemplateRepository.create(input);
  },

  async patch(role: string, id: string, input: ShiftTemplatePatch) {
    assertAdmin(role);
    const existing = await shiftTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Shift template not found');
    }

    const startTime = input.startTime ?? existing.startTime;
    const endTime = input.endTime ?? existing.endTime;
    const plusOneDay = input.plusOneDay ?? existing.plusOneDay;
    assertValidTimeRange(startTime, endTime, plusOneDay);

    const updated = await shiftTemplateRepository.update(id, input);
    return updated!;
  },

  async remove(role: string, id: string) {
    assertAdmin(role);
    const existing = await shiftTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Shift template not found');
    }
    const removed = await shiftTemplateRepository.remove(id);
    return removed!;
  },
};
