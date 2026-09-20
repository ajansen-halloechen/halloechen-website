export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends DomainError {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

export function mapDomainErrorToHttp(error: unknown): never {
  if (error instanceof NotFoundError) {
    throw createError({ statusCode: 404, statusMessage: error.message });
  }
  if (error instanceof ForbiddenError) {
    throw createError({ statusCode: 403, statusMessage: error.message });
  }
  if (error instanceof ConflictError) {
    throw createError({ statusCode: 409, statusMessage: error.message });
  }
  if (error instanceof ValidationError) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }
  throw error;
}
