import { timingSafeEqual } from 'node:crypto';
import { createError } from 'h3';
import {
  dateTimeRangeValidationMessage,
  validateDateTimeRange,
} from '~~/shared/time-range-validation';
import { getCalendarFeedToken, getPublicSiteUrl } from '#server/utils/env';
import { buildCalendarIcs } from '#server/utils/ics';
import { calendarEntryRepository } from './calendar-entry.repository';
import type {
  CalendarEntryCreate,
  CalendarEntryPatch,
  CalendarEntryType,
} from '#shared/types/calendar-entry';

function assertFeedTokenConfigured(): string {
  const token = getCalendarFeedToken();
  if (!token) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Calendar feed is not configured.',
    });
  }
  return token;
}

function isValidFeedToken(provided: string): boolean {
  const expected = getCalendarFeedToken();
  if (!expected) return false;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(providedBuf, expectedBuf);
}

function assertValidDateTimeRange(
  startDate: Date,
  startTime: string,
  endDate: Date,
  endTime: string,
) {
  const error = validateDateTimeRange({
    startDate,
    startTime,
    endDate,
    endTime,
  });

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: dateTimeRangeValidationMessage(error),
    });
  }
}

export const calendarEntryService = {
  async getAll(
    month: { year: number; month: number },
    options?: { type?: CalendarEntryType },
  ) {
    return calendarEntryRepository.findByMonth(
      month.year,
      month.month,
      options,
    );
  },

  async getById(id: string) {
    const entry = await calendarEntryRepository.findById(id);
    if (!entry) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Calendar entry not found',
      });
    }
    return entry;
  },

  async create(createdByUserId: string, input: CalendarEntryCreate) {
    assertValidDateTimeRange(
      input.startDate,
      input.startTime,
      input.endDate,
      input.endTime,
    );

    return calendarEntryRepository.create({ ...input, createdByUserId });
  },

  async patch(id: string, input: CalendarEntryPatch) {
    const existing = await calendarEntryRepository.findById(id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Calendar entry not found',
      });
    }

    const startDate = input.startDate ?? existing.startDate;
    const startTime = input.startTime ?? existing.startTime;
    const endDate = input.endDate ?? existing.endDate;
    const endTime = input.endTime ?? existing.endTime;

    assertValidDateTimeRange(startDate, startTime, endDate, endTime);

    const entry = await calendarEntryRepository.update(id, input);
    return entry!;
  },

  async remove(id: string) {
    const existing = await calendarEntryRepository.findById(id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Calendar entry not found',
      });
    }

    const entry = await calendarEntryRepository.remove(id);
    return entry!;
  },

  getFeedUrl() {
    const token = assertFeedTokenConfigured();
    return `${getPublicSiteUrl()}/api/calendar-feed/${token}.ics`;
  },

  async getIcsFeed(token: string) {
    if (!getCalendarFeedToken()) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Calendar feed is not configured.',
      });
    }

    if (!isValidFeedToken(token)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not found',
      });
    }

    const entries = await calendarEntryRepository.findAll();
    return buildCalendarIcs(entries);
  },
};
