"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggerMiddleware = requestLoggerMiddleware;
const uuid_1 = require("uuid");
const logger_1 = require("../logging/logger");
function requestLoggerMiddleware() {
    return (req, res, next) => {
        const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
        const startTime = Date.now();
        // Attach request ID
        req.headers['x-request-id'] = requestId;
        res.setHeader('x-request-id', requestId);
        // Log on response finish
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logData = {
                requestId,
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                tenantId: req.tenantId,
                userId: req.user?.userId,
                userAgent: req.headers['user-agent'],
                ip: req.ip,
                contentLength: res.getHeader('content-length'),
            };
            if (res.statusCode >= 500) {
                logger_1.logger.error('Request failed', logData);
            }
            else if (res.statusCode >= 400) {
                logger_1.logger.warn('Request error', logData);
            }
            else {
                logger_1.logger.info('Request completed', logData);
            }
        });
        next();
    };
}
//# sourceMappingURL=request-logger.js.map