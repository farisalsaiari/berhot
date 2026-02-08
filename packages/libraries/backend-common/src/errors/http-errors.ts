import { BaseError } from './base-error';

export class BadRequestError extends BaseError {
  constructor(message = 'Bad Request', details?: Record<string, unknown>) {
    super(message, 'BAD_REQUEST', 400, true, details);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = 'Resource', id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message = 'Conflict', details?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, true, details);
  }
}

export class ValidationError extends BaseError {
  constructor(message = 'Validation failed', details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 422, true, details);
  }
}

export class TooManyRequestsError extends BaseError {
  constructor(retryAfter?: number) {
    super('Too many requests', 'RATE_LIMITED', 429, true, { retryAfter });
  }
}

export class InternalServerError extends BaseError {
  constructor(message = 'Internal server error') {
    super(message, 'INTERNAL_ERROR', 500, false);
  }
}

export class TenantNotFoundError extends BaseError {
  constructor(tenantId: string) {
    super(`Tenant '${tenantId}' not found`, 'TENANT_NOT_FOUND', 404);
  }
}

export class TenantSuspendedError extends BaseError {
  constructor(tenantId: string) {
    super(`Tenant '${tenantId}' is suspended`, 'TENANT_SUSPENDED', 403);
  }
}

export class ProductNotEntitledError extends BaseError {
  constructor(tenantId: string, productId: string) {
    super(
      `Tenant '${tenantId}' is not entitled to product '${productId}'`,
      'PRODUCT_NOT_ENTITLED',
      403,
    );
  }
}
