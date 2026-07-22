import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { toDateTime } from './shared/time-range-validation.ts';

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

const shiftAssignmentSchema = z.object({
  userId: z.uuid(),
  plannedShiftId: z.uuid(),
});

type ShiftTemplate = z.infer<typeof shiftTemplateSchema>;
type PlannedShift = z.infer<typeof plannedShiftSchema>;
type ShiftAvailability = z.infer<typeof shiftAvailabilitySchema>;
type ShiftBlocker = z.infer<typeof shiftBlockerSchema>;
type User = z.infer<typeof userSchema>;
type ShiftAssignment = z.infer<typeof shiftAssignmentSchema>;
type AvailabilityStatus = z.infer<typeof shiftAvailabilityStatusSchema>;

type OptimizeResult = {
  feasible: boolean;
  assignments: ShiftAssignment[];
  /** Lower is better (fairness + clustering − preference). */
  score: number | null;
};

const SCORE = {
  /** Cost per unit of load above/below the ideal average. */
  fairness: 100,
  /** Cost when a user works two shifts within this many days. */
  closeDaysThreshold: 10,
  closeDays: 8,
  /** Extra cost when two of a user's shifts fall in consecutive weeks. */
  adjacentWeeks: 12,
  /** Bonus (negative cost) for preference availability. */
  preference: -3,
} as const;

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
    const userBlockers = blockers.filter((blocker) => blocker.userId === userId);

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

/** Monday-based week start as `YYYY-MM-DD` (local date). */
function getWeekStartKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return formatDate(d);
}

function dayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(dayNumber(a) - dayNumber(b));
}

function areAdjacentWeeks(weekA: string, weekB: string): boolean {
  if (weekA === weekB) {
    return false;
  }
  const [earlier, later] = weekA < weekB ? [weekA, weekB] : [weekB, weekA];
  const [y, m, d] = earlier.split('-').map(Number);
  const next = new Date(y!, m! - 1, d!);
  next.setDate(next.getDate() + 7);
  return formatDate(next) === later;
}

type PlannerContext = {
  users: User[];
  plannedShifts: PlannedShift[];
  shiftById: Map<string, PlannedShift>;
  availabilityByKey: Map<string, AvailabilityStatus>;
  eligibleUserIdsByShift: Map<string, string[]>;
  targetLoad: number;
};

function buildContext(
  users: User[],
  plannedShifts: PlannedShift[],
  availabilities: ShiftAvailability[],
): PlannerContext {
  const availabilityByKey = new Map(
    availabilities.map((availability) => [
      `${availability.userId}__${availability.plannedShiftId}`,
      availability.availability,
    ]),
  );

  const eligibleUserIdsByShift = new Map<string, string[]>();
  for (const shift of plannedShifts) {
    const eligible = users
      .map((user) => user.id)
      .filter((userId) => {
        const status =
          availabilityByKey.get(`${userId}__${shift.id}`) ?? 'unavailable';
        return status !== 'unavailable';
      });
    eligibleUserIdsByShift.set(shift.id, eligible);
  }

  const totalSlots = plannedShifts.reduce(
    (sum, shift) => sum + shift.numberOfPersons,
    0,
  );

  return {
    users,
    plannedShifts,
    shiftById: new Map(plannedShifts.map((shift) => [shift.id, shift])),
    availabilityByKey,
    eligibleUserIdsByShift,
    targetLoad: users.length === 0 ? 0 : totalSlots / users.length,
  };
}

function getAvailabilityStatus(
  ctx: PlannerContext,
  userId: string,
  shiftId: string,
): AvailabilityStatus {
  return ctx.availabilityByKey.get(`${userId}__${shiftId}`) ?? 'unavailable';
}

function isUserEligibleForShift(
  ctx: PlannerContext,
  assignments: ShiftAssignment[],
  userId: string,
  shiftId: string,
): boolean {
  if (getAvailabilityStatus(ctx, userId, shiftId) === 'unavailable') {
    return false;
  }

  const shift = ctx.shiftById.get(shiftId);
  if (!shift) {
    return false;
  }

  const week = getWeekStartKey(shift.date);
  return !assignments.some((assignment) => {
    if (assignment.userId !== userId) {
      return false;
    }
    const other = ctx.shiftById.get(assignment.plannedShiftId);
    return other ? getWeekStartKey(other.date) === week : false;
  });
}

function scoreAssignments(
  ctx: PlannerContext,
  assignments: ShiftAssignment[],
): number {
  let score = 0;
  const byUser = new Map<string, PlannedShift[]>();

  for (const user of ctx.users) {
    byUser.set(user.id, []);
  }

  for (const assignment of assignments) {
    const shift = ctx.shiftById.get(assignment.plannedShiftId);
    if (!shift) {
      continue;
    }
    const list = byUser.get(assignment.userId) ?? [];
    list.push(shift);
    byUser.set(assignment.userId, list);

    if (
      getAvailabilityStatus(ctx, assignment.userId, assignment.plannedShiftId) ===
      'preference'
    ) {
      score += SCORE.preference;
    }
  }

  for (const shifts of byUser.values()) {
    const load = shifts.length;
    score += SCORE.fairness * Math.abs(load - ctx.targetLoad);

    const sorted = [...shifts].sort((a, b) => a.date.getTime() - b.date.getTime());
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i]!;
        const b = sorted[j]!;
        const gap = daysBetween(a.date, b.date);
        if (gap < SCORE.closeDaysThreshold) {
          score += SCORE.closeDays * (SCORE.closeDaysThreshold - gap);
        }
        if (
          areAdjacentWeeks(getWeekStartKey(a.date), getWeekStartKey(b.date))
        ) {
          score += SCORE.adjacentWeeks;
        }
      }
    }
  }

  return score;
}

/**
 * Constructive pass: fill scarcest shifts first, picking the eligible user
 * who worsens the global score the least.
 */
function buildGreedyAssignments(ctx: PlannerContext): ShiftAssignment[] | null {
  const assignments: ShiftAssignment[] = [];
  const openSlots = new Map(
    ctx.plannedShifts.map((shift) => [shift.id, shift.numberOfPersons]),
  );

  const shiftOrder = [...ctx.plannedShifts].sort((a, b) => {
    const eligibleA = ctx.eligibleUserIdsByShift.get(a.id)?.length ?? 0;
    const eligibleB = ctx.eligibleUserIdsByShift.get(b.id)?.length ?? 0;
    if (eligibleA !== eligibleB) {
      return eligibleA - eligibleB;
    }
    return a.date.getTime() - b.date.getTime();
  });

  for (const shift of shiftOrder) {
    let remaining = openSlots.get(shift.id) ?? 0;

    while (remaining > 0) {
      const candidates = (ctx.eligibleUserIdsByShift.get(shift.id) ?? []).filter(
        (userId) =>
          isUserEligibleForShift(ctx, assignments, userId, shift.id) &&
          !assignments.some(
            (assignment) =>
              assignment.userId === userId &&
              assignment.plannedShiftId === shift.id,
          ),
      );

      if (candidates.length === 0) {
        return null;
      }

      let bestUserId = candidates[0]!;
      let bestScore = Number.POSITIVE_INFINITY;

      for (const userId of candidates) {
        const trial = [
          ...assignments,
          shiftAssignmentSchema.parse({ userId, plannedShiftId: shift.id }),
        ];
        const trialScore = scoreAssignments(ctx, trial);
        if (trialScore < bestScore) {
          bestScore = trialScore;
          bestUserId = userId;
        }
      }

      assignments.push(
        shiftAssignmentSchema.parse({
          userId: bestUserId,
          plannedShiftId: shift.id,
        }),
      );
      remaining -= 1;
    }
  }

  return assignments;
}

/**
 * Local search: try reassigning a slot to another eligible user whenever
 * the global score improves.
 */
function improveAssignments(
  ctx: PlannerContext,
  initial: ShiftAssignment[],
): ShiftAssignment[] {
  let current = [...initial];
  let currentScore = scoreAssignments(ctx, current);
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 0; i < current.length; i++) {
      const assignment = current[i]!;
      const candidates = (ctx.eligibleUserIdsByShift.get(
        assignment.plannedShiftId,
      ) ?? []).filter((userId) => userId !== assignment.userId);

      for (const userId of candidates) {
        const without = current.filter((_, index) => index !== i);
        if (
          !isUserEligibleForShift(
            ctx,
            without,
            userId,
            assignment.plannedShiftId,
          )
        ) {
          continue;
        }

        const next = [
          ...without,
          shiftAssignmentSchema.parse({
            userId,
            plannedShiftId: assignment.plannedShiftId,
          }),
        ];
        const nextScore = scoreAssignments(ctx, next);
        if (nextScore + 1e-9 < currentScore) {
          current = next;
          currentScore = nextScore;
          improved = true;
          break;
        }
      }

      if (improved) {
        break;
      }
    }
  }

  return current;
}

/**
 * Assign users to planned shifts for one month.
 *
 * Hard constraints:
 * - each shift filled to `numberOfPersons`
 * - unavailable users never assigned
 * - at most one shift per user per week
 *
 * Soft objectives (greedy + local search):
 * - equalize shift count across users
 * - spread a user's shifts across the month
 * - prefer `preference` availability when present
 */
function optimizeShiftAssignments(
  users: User[],
  plannedShifts: PlannedShift[],
  availabilities: ShiftAvailability[],
): OptimizeResult {
  if (users.length === 0 || plannedShifts.length === 0) {
    return { feasible: plannedShifts.length === 0, assignments: [], score: 0 };
  }

  const ctx = buildContext(users, plannedShifts, availabilities);
  const greedy = buildGreedyAssignments(ctx);
  if (!greedy) {
    return { feasible: false, assignments: [], score: null };
  }

  const assignments = improveAssignments(ctx, greedy);
  return {
    feasible: true,
    assignments,
    score: scoreAssignments(ctx, assignments),
  };
}

function loadShiftBlockers(path: string): ShiftBlocker[] {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return z.array(shiftBlockerSchema).parse(raw);
}

function loadUsers(path: string): User[] {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return z.array(userSchema).parse(raw);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function displayName(user: User): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email;
}

function summarizePlan(
  users: User[],
  plannedShifts: PlannedShift[],
  assignments: ShiftAssignment[],
): void {
  const userById = new Map(users.map((user) => [user.id, user]));
  const shiftById = new Map(plannedShifts.map((shift) => [shift.id, shift]));

  const loadByUser = new Map<string, number>();
  for (const user of users) {
    loadByUser.set(user.id, 0);
  }
  for (const assignment of assignments) {
    loadByUser.set(
      assignment.userId,
      (loadByUser.get(assignment.userId) ?? 0) + 1,
    );
  }

  const loads = [...loadByUser.values()];
  const minLoad = Math.min(...loads);
  const maxLoad = Math.max(...loads);

  console.log('\n=== Optimized assignments ===');
  const sortedShifts = [...plannedShifts].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  for (const shift of sortedShifts) {
    const assignees = assignments
      .filter((assignment) => assignment.plannedShiftId === shift.id)
      .map((assignment) => {
        const user = userById.get(assignment.userId);
        return user ? displayName(user) : assignment.userId;
      });
    console.log(
      `  ${formatDate(shift.date)} ${shift.startTime}  (${assignees.length}/${shift.numberOfPersons})  ${assignees.join(', ') || '—'}`,
    );
  }

  console.log('\n=== Load per user ===');
  const sortedUsers = [...users].sort(
    (a, b) => (loadByUser.get(b.id) ?? 0) - (loadByUser.get(a.id) ?? 0),
  );
  for (const user of sortedUsers) {
    const load = loadByUser.get(user.id) ?? 0;
    const assigned = assignments
      .filter((assignment) => assignment.userId === user.id)
      .map((assignment) => {
        const shift = shiftById.get(assignment.plannedShiftId);
        return shift ? formatDate(shift.date) : '?';
      })
      .sort();
    console.log(
      `  ${String(load).padStart(2)}  ${displayName(user).padEnd(24)}  ${assigned.join(', ') || '—'}`,
    );
  }

  console.log(
    `\nLoad range: ${minLoad}–${maxLoad} (target ≈ ${(assignments.length / users.length).toFixed(2)})`,
  );
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const shiftBlockers = loadShiftBlockers(join(scriptDir, 'shift-blockers.json'));
const allUsers = loadUsers(join(scriptDir, 'users.json'));
const eligibleUsers = allUsers.filter(
  (user) => !user.isPending && user.email !== 'info@halloechen.org',
);

const august2026 = planShiftsForMonth(2026, 8, templates);
const availabilities = getAvailability(
  eligibleUsers.map((user) => user.id),
  shiftBlockers,
  august2026,
);

const unavailableCount = availabilities.filter(
  (a) => a.availability === 'unavailable',
).length;
const availableCount = availabilities.filter(
  (a) => a.availability === 'available',
).length;

console.log(`Loaded ${shiftBlockers.length} shift blockers`);
console.log(`Eligible users: ${eligibleUsers.length}`);
console.log(`Planned shifts for August 2026: ${august2026.length}`);
console.log(
  `Availabilities: ${availabilities.length} (${availableCount} available, ${unavailableCount} unavailable)`,
);

const optimized = optimizeShiftAssignments(
  eligibleUsers,
  august2026,
  availabilities,
);

if (!optimized.feasible) {
  console.error('\nOptimizer found no feasible assignment.');
  process.exitCode = 1;
} else {
  console.log(
    `\nFeasible plan with ${optimized.assignments.length} assignments` +
      (optimized.score === null ? '' : ` (score=${optimized.score.toFixed(2)})`),
  );
  summarizePlan(eligibleUsers, august2026, optimized.assignments);
}
