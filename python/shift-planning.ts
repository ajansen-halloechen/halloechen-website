import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { toDateTime } from '../shared/time-range-validation.ts';

const shiftTypeSchema = z.enum(['barShift']);

/** 0 = Sunday … 6 = Saturday (matches Date.getDay()) */
const dayOfTheWeekSchema = z.number().int().min(0).max(6);

const shiftTemplateSchema = z.object({
  id: z.uuid(),
  dayOfTheWeek: dayOfTheWeekSchema,
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  plusOneDay: z.boolean(),
  numberOfPersons: z.number().int().positive(),
  shiftType: shiftTypeSchema,
});

const plannedShiftSchema = z.object({
  id: z.uuid(),
  shiftTemplateId: z.uuid(),
  date: z.date(),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  plusOneDay: z.boolean(),
  numberOfPersons: z.number().int().positive(),
  shiftType: shiftTypeSchema,
});

/** JSON wire format for PlannedShift (Node → Python). */
const plannedShiftJsonSchema = plannedShiftSchema.extend({
  date: z.iso.date(),
});

const shiftAvailabilityStatusSchema = z.enum([
  'available',
  'preference',
  'unavailable',
]);

const shiftAvailabilitySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  plannedShiftId: z.uuid(),
  availability: shiftAvailabilityStatusSchema,
});

const shiftBlockerSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  startDate: z.coerce.date(),
  startTime: z.iso.time(),
  endDate: z.coerce.date(),
  endTime: z.iso.time(),
  description: z.string().max(500),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.string(),
  isPending: z.boolean(),
});

type ShiftTemplate = z.infer<typeof shiftTemplateSchema>;
type PlannedShift = z.infer<typeof plannedShiftSchema>;
type PlannedShiftJson = z.infer<typeof plannedShiftJsonSchema>;
type ShiftAvailability = z.infer<typeof shiftAvailabilitySchema>;
type ShiftBlocker = z.infer<typeof shiftBlockerSchema>;
type User = z.infer<typeof userSchema>;

const templates: ShiftTemplate[] = [
  shiftTemplateSchema.parse({
    id: randomUUID(),
    dayOfTheWeek: 4, // Thursday
    startTime: '18:00:00',
    endTime: '02:00:00',
    plusOneDay: true,
    numberOfPersons: 2,
    shiftType: 'barShift',
  }),
  shiftTemplateSchema.parse({
    id: randomUUID(),
    dayOfTheWeek: 5, // Friday
    startTime: '18:00:00',
    endTime: '02:00:00',
    plusOneDay: true,
    numberOfPersons: 2,
    shiftType: 'barShift',
  }),
  shiftTemplateSchema.parse({
    id: randomUUID(),
    dayOfTheWeek: 6, // Saturday
    startTime: '18:00:00',
    endTime: '02:00:00',
    plusOneDay: true,
    numberOfPersons: 2,
    shiftType: 'barShift',
  }),
];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function planShiftsForMonth(
  year: number,
  month: number,
  shiftTemplates: ShiftTemplate[],
): PlannedShift[] {
  const planned: PlannedShift[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();

    for (const template of shiftTemplates) {
      if (template.dayOfTheWeek !== weekday) {
        continue;
      }

      planned.push(
        plannedShiftSchema.parse({
          id: randomUUID(),
          shiftTemplateId: template.id,
          date,
          startTime: template.startTime,
          endTime: template.endTime,
          plusOneDay: template.plusOneDay,
          numberOfPersons: template.numberOfPersons,
          shiftType: template.shiftType,
        }),
      );
    }
  }

  return planned;
}

/**
 * A user is unavailable for a planned shift when the shift's start
 * falls inside one of their blockers. Shift endTime is ignored for now.
 */
function isBlockedAtShiftStart(
  blocker: ShiftBlocker,
  shift: PlannedShift,
): boolean {
  const shiftStart = toDateTime(shift.date, shift.startTime);
  const blockerStart = toDateTime(blocker.startDate, blocker.startTime);
  const blockerEnd = toDateTime(blocker.endDate, blocker.endTime);

  return shiftStart >= blockerStart && shiftStart <= blockerEnd;
}

function getAvailability(
  userIds: string[],
  blockers: ShiftBlocker[],
  plannedShifts: PlannedShift[],
): ShiftAvailability[] {
  const availabilities: ShiftAvailability[] = [];

  for (const userId of userIds) {
    const userBlockers = blockers.filter(
      (blocker) => blocker.userId === userId,
    );

    for (const shift of plannedShifts) {
      const unavailable = userBlockers.some((blocker) =>
        isBlockedAtShiftStart(blocker, shift),
      );

      availabilities.push(
        shiftAvailabilitySchema.parse({
          id: randomUUID(),
          userId,
          plannedShiftId: shift.id,
          availability: unavailable ? 'unavailable' : 'available',
        }),
      );
    }
  }

  return availabilities;
}

function toPlannedShiftJson(shift: PlannedShift): PlannedShiftJson {
  return plannedShiftJsonSchema.parse({
    ...shift,
    date: formatDate(shift.date),
  });
}

function loadShiftBlockers(path: string): ShiftBlocker[] {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return z.array(shiftBlockerSchema).parse(raw);
}

function loadUsers(path: string): User[] {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return z.array(userSchema).parse(raw);
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const shiftBlockers = loadShiftBlockers(
  join(scriptDir, '/data/202609/shift-blockers.json'),
);
const users = loadUsers(join(scriptDir, 'users.json'));

const excludedDates = new Set(['2026-08-01']);
const plannedShifts = planShiftsForMonth(2026, 9, templates).filter(
  (shift) => !excludedDates.has(formatDate(shift.date)),
);
const shiftAvailabilities = getAvailability(
  users.map((user) => user.id),
  shiftBlockers,
  plannedShifts,
);

const plannedShiftsJson = z
  .array(plannedShiftJsonSchema)
  .parse(plannedShifts.map(toPlannedShiftJson));
const shiftAvailabilitiesJson = z
  .array(shiftAvailabilitySchema)
  .parse(shiftAvailabilities);

const plannedShiftsPath = join(scriptDir, 'planned-shifts.json');
const shiftAvailabilitiesPath = join(scriptDir, 'shift-availabilities.json');

writeJson(plannedShiftsPath, plannedShiftsJson);
writeJson(shiftAvailabilitiesPath, shiftAvailabilitiesJson);

const unavailableCount = shiftAvailabilitiesJson.filter(
  (a) => a.availability === 'unavailable',
).length;
const availableCount = shiftAvailabilitiesJson.filter(
  (a) => a.availability === 'available',
).length;

console.log(
  `Wrote ${plannedShiftsJson.length} planned shifts → ${plannedShiftsPath}`,
);
console.log(
  `Wrote ${shiftAvailabilitiesJson.length} availabilities` +
    ` (${availableCount} available, ${unavailableCount} unavailable)` +
    ` → ${shiftAvailabilitiesPath}`,
);
