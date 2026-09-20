import { join } from 'node:path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {
  ConflictError,
  ValidationError,
} from '#server/utils/domain-errors';

export const AvailabilityStatusProto = {
  AVAILABLE: 1,
  PREFERENCE: 2,
  UNAVAILABLE: 3,
} as const;

export type PlannerPlannedShift = {
  id: string;
  date: string;
  numberOfPersons: number;
};

export type PlannerAvailability = {
  userId: string;
  plannedShiftId: string;
  status: number;
};

export type PlannerUserPreference = {
  userId: string;
  maxShiftsPerMonth: number;
  shiftsOnConsecutiveDays: boolean;
  shiftsInConsecutiveWeeks: boolean;
};

export type PlannerAssignment = {
  plannedShiftId: string;
  userId: string;
};

export type PlanShiftsInput = {
  month: string;
  plannedShifts: PlannerPlannedShift[];
  availabilities: PlannerAvailability[];
  userPreferences: PlannerUserPreference[];
};

type PlanShiftsResponse = {
  assignments: PlannerAssignment[];
};

type ShiftPlannerClient = {
  PlanShifts: (
    request: Record<string, unknown>,
    callback: (
      error: grpc.ServiceError | null,
      response: PlanShiftsResponse,
    ) => void,
  ) => void;
};

type PlannerPackage = {
  planner: {
    v1: {
      ShiftPlannerService: new (
        address: string,
        credentials: grpc.ChannelCredentials,
      ) => ShiftPlannerClient;
    };
  };
};

let cachedClient: ShiftPlannerClient | null = null;
let cachedAddress: string | null = null;

function loadClient(address: string): ShiftPlannerClient {
  if (cachedClient && cachedAddress === address) {
    return cachedClient;
  }

  const protoPath = join(process.cwd(), 'proto/planner/v1/planner.proto');
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: Number,
    defaults: true,
    oneofs: true,
    includeDirs: [join(process.cwd(), 'proto')],
  });

  const proto = grpc.loadPackageDefinition(
    packageDefinition,
  ) as unknown as PlannerPackage;

  cachedClient = new proto.planner.v1.ShiftPlannerService(
    address,
    grpc.credentials.createInsecure(),
  );
  cachedAddress = address;
  return cachedClient;
}

function mapGrpcError(error: grpc.ServiceError): never {
  if (error.code === grpc.status.INVALID_ARGUMENT) {
    throw new ValidationError(error.details || error.message);
  }
  if (error.code === grpc.status.FAILED_PRECONDITION) {
    throw new ConflictError(error.details || error.message);
  }
  if (
    error.code === grpc.status.UNAVAILABLE ||
    error.code === grpc.status.DEADLINE_EXCEEDED
  ) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Shift planner service unavailable',
    });
  }
  throw createError({
    statusCode: 502,
    statusMessage: error.details || error.message || 'Shift planner error',
  });
}

export async function planShifts(
  input: PlanShiftsInput,
): Promise<PlannerAssignment[]> {
  const config = useRuntimeConfig();
  const address = `${config.plannerHost}:${config.plannerPort}`;
  const client = loadClient(address);

  const response = await new Promise<PlanShiftsResponse>((resolve, reject) => {
    client.PlanShifts(
      {
        month: input.month,
        plannedShifts: input.plannedShifts,
        availabilities: input.availabilities,
        userPreferences: input.userPreferences,
      },
      (error, res) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(res);
      },
    );
  }).catch((error: unknown) => {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof (error as grpc.ServiceError).code === 'number'
    ) {
      mapGrpcError(error as grpc.ServiceError);
    }
    throw createError({
      statusCode: 503,
      statusMessage: 'Shift planner service unavailable',
    });
  });

  return (response.assignments ?? []).map((assignment) => ({
    plannedShiftId: assignment.plannedShiftId,
    userId: assignment.userId,
  }));
}
