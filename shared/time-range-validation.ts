export type DateTimeRangeInput = {
  startDate: Date | string;
  startTime: string;
  endDate: Date | string;
  endTime: string;
};

export type DateTimeRangeError = 'end_before_start';

function toDateParts(date: Date | string): [number, number, number] {
  if (typeof date === 'string') {
    const [y = 0, m = 0, d = 0] = date.slice(0, 10).split('-').map(Number);
    return [y, m, d];
  }
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
}

function toIsoDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function toDateTime(date: Date | string, time: string): Date {
  const [y, m, d] = toDateParts(date);
  const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hours, minutes, seconds, 0);
}

export function addDays(date: Date | string, days: number): string {
  const [y, m, d] = toDateParts(date);
  const result = new Date(y, m - 1, d);
  result.setDate(result.getDate() + days);
  return toIsoDateString(result);
}

export function validateDateTimeRange(
  input: DateTimeRangeInput,
): DateTimeRangeError | null {
  const start = toDateTime(input.startDate, input.startTime);
  const end = toDateTime(input.endDate, input.endTime);

  if (end <= start) {
    return 'end_before_start';
  }

  return null;
}

export function dateTimeRangeValidationMessage(
  error: DateTimeRangeError,
): string {
  switch (error) {
    case 'end_before_start':
      return 'Das Ende darf nicht vor dem Beginn liegen.';
  }
}

export function workingHourToDateTimeRange(input: {
  date: Date | string;
  startTime: string;
  endTime: string;
  plusOneDay: boolean;
}): DateTimeRangeInput {
  return {
    startDate: input.date,
    startTime: input.startTime,
    endDate: input.plusOneDay ? addDays(input.date, 1) : input.date,
    endTime: input.endTime,
  };
}
