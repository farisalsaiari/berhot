"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantContextMiddleware = tenantContextMiddleware;
exports.tenantIsolationMiddleware = tenantIsolationMiddleware;
const http_errors_1 = require("../errors/http-errors");
const logger_1 = require("../logging/logger");
function tenantContextMiddleware(options = {}) {
    const { headerName = 'x-tenant-id', required = true } = options;
    return (req, _res, next) => {
        // Priority: 1. JWT token, 2. Header, 3. Subdomain
        let tenantId = req.user?.tenantId ?? req.headers[headerName];
        if (!tenantId) {
            // Try subdomain resolution: {tenant}.berhot.com
            const host = req.hostname;
            const subdomain = host.split('.')[0];
            if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
                tenantId = subdomain;
            }
        }
        if (!tenantId && required) {
            return next(new http_errors_1.UnauthorizedError('Tenant context required'));
        }
        if (tenantId) {
            req.tenantId = tenantId;
            logger_1.logger.debug('Tenant context set', { tenantId, path: req.path });
        }
        next();
    };
}
/**
 * Ensures the authenticated user belongs to the requested tenant.
 * Prevents cross-tenant data access.
 */
function tenantIsolationMiddleware() {
    return (req, _res, next) => {
        if (!req.user || !req.tenantId) {
            return next();
        }
        // Super admins can access any tenant
        if (req.user.role === 'super_admin') {
            return next();
        }
        if (req.user.tenantId !== req.tenantId) {
            logger_1.logger.warn('Cross-tenant access attempt', {
                userId: req.user.userId,
                userTenant: req.user.tenantId,
                requestedTenant: req.tenantId,
                path: req.path,
            });
            return next(new http_errors_1.TenantNotFoundError(req.tenantId));
        }
        next();
    };
}
//# sourceMappingURL=tenant-context.js.map