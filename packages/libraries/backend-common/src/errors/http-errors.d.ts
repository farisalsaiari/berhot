import { BaseError } from './base-error';
export declare class BadRequestError extends BaseError {
    constructor(message?: string, details?: Record<string, unknown>);
}
export declare class UnauthorizedError extends BaseError {
    constructor(message?: string);
}
export declare class ForbiddenError extends BaseError {
    constructor(message?: string);
}
export declare class NotFoundError extends BaseError {
    constructor(resource?: string, id?: string);
}
export declare class ConflictError extends BaseError {
    constructor(message?: string, details?: Record<string, unknown>);
}
export declare class ValidationError extends BaseError {
    constructor(message?: string, details?: Record<string, unknown>);
}
export declare class TooManyRequestsError extends BaseError {
    constructor(retryAfter?: number);
}
export declare class InternalServerError extends BaseError {
    constructor(message?: string);
}
export declare class TenantNotFoundError extends BaseError {
    constructor(tenantId: string);
}
export declare class TenantSuspendedError extends BaseError {
    constructor(tenantId: string);
}
export declare class ProductNotEntitledError extends BaseError {
    constructor(tenantId: string, productId: string);
}
//# sourceMappingURL=http-errors.d.ts.map