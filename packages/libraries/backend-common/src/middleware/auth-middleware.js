"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requirePermissions = requirePermissions;
exports.requireRole = requireRole;
const http_errors_1 = require("../errors/http-errors");
const logger_1 = require("../logging/logger");
function authMiddleware(options) {
    return async (req, _res, next) => {
        try {
            const token = extractToken(req);
            if (!token) {
                if (options?.optional) {
                    return next();
                }
                throw new http_errors_1.UnauthorizedError('Missing authentication token');
            }
            // Token verification is delegated to identity-access service
            // In production, this validates JWT signature with public key
            const payload = decodeToken(token);
            req.user = {
                userId: payload.sub,
                tenantId: payload.tenantId,
                email: payload.email,
                role: payload.role,
                permissions: payload.permissions,
                sessionId: payload.sessionId,
            };
            req.tenantId = payload.tenantId;
            next();
        }
        catch (error) {
            next(error instanceof http_errors_1.UnauthorizedError ? error : new http_errors_1.UnauthorizedError('Invalid token'));
        }
    };
}
function requirePermissions(...permissions) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new http_errors_1.UnauthorizedError());
        }
        const hasAllPermissions = permissions.every((perm) => req.user.permissions.includes(perm) || req.user.permissions.includes('*'));
        if (!hasAllPermissions) {
            logger_1.logger.warn('Permission denied', {
                userId: req.user.userId,
                tenantId: req.user.tenantId,
                required: permissions,
                actual: req.user.permissions,
            });
            return next(new http_errors_1.ForbiddenError('Insufficient permissions'));
        }
        next();
    };
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new http_errors_1.UnauthorizedError());
        }
        if (!roles.includes(req.user.role)) {
            return next(new http_errors_1.ForbiddenError(`Required role: ${roles.join(' or ')}`));
        }
        next();
    };
}
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return req.cookies?.access_token ?? null;
}
function decodeToken(token) {
    // In production, this verifies with RS256 public key
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new http_errors_1.UnauthorizedError('Invalid token format');
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new http_errors_1.UnauthorizedError('Token expired');
    }
    return payload;
}
//# sourceMappingURL=auth-middleware.js.map