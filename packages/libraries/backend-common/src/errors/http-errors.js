"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductNotEntitledError = exports.TenantSuspendedError = exports.TenantNotFoundError = exports.InternalServerError = exports.TooManyRequestsError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = void 0;
const base_error_1 = require("./base-error");
class BadRequestError extends base_error_1.BaseError {
    constructor(message = 'Bad Request', details) {
        super(message, 'BAD_REQUEST', 400, true, details);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends base_error_1.BaseError {
    constructor(message = 'Unauthorized') {
        super(message, 'UNAUTHORIZED', 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends base_error_1.BaseError {
    constructor(message = 'Forbidden') {
        super(message, 'FORBIDDEN', 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends base_error_1.BaseError {
    constructor(resource = 'Resource', id) {
        const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
        super(message, 'NOT_FOUND', 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends base_error_1.BaseError {
    constructor(message = 'Conflict', details) {
        super(message, 'CONFLICT', 409, true, details);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends base_error_1.BaseError {
    constructor(message = 'Validation failed', details) {
        super(message, 'VALIDATION_ERROR', 422, true, details);
    }
}
exports.ValidationError = ValidationError;
class TooManyRequestsError extends base_error_1.BaseError {
    constructor(retryAfter) {
        super('Too many requests', 'RATE_LIMITED', 429, true, { retryAfter });
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalServerError extends base_error_1.BaseError {
    constructor(message = 'Internal server error') {
        super(message, 'INTERNAL_ERROR', 500, false);
    }
}
exports.InternalServerError = InternalServerError;
class TenantNotFoundError extends base_error_1.BaseError {
    constructor(tenantId) {
        super(`Tenant '${tenantId}' not found`, 'TENANT_NOT_FOUND', 404);
    }
}
exports.TenantNotFoundError = TenantNotFoundError;
class TenantSuspendedError extends base_error_1.BaseError {
    constructor(tenantId) {
        super(`Tenant '${tenantId}' is suspended`, 'TENANT_SUSPENDED', 403);
    }
}
exports.TenantSuspendedError = TenantSuspendedError;
class ProductNotEntitledError extends base_error_1.BaseError {
    constructor(tenantId, productId) {
        super(`Tenant '${tenantId}' is not entitled to product '${productId}'`, 'PRODUCT_NOT_ENTITLED', 403);
    }
}
exports.ProductNotEntitledError = ProductNotEntitledError;
//# sourceMappingURL=http-errors.js.map