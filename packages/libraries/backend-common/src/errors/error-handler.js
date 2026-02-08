"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
exports.asyncHandler = asyncHandler;
const base_error_1 = require("./base-error");
const api_response_1 = require("../types/api-response");
const logger_1 = require("../logging/logger");
function globalErrorHandler(err, req, res, _next) {
    if (err instanceof base_error_1.BaseError) {
        if (!err.isOperational) {
            logger_1.logger.error('Non-operational error', {
                error: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method,
            });
        }
        res.status(err.statusCode).json((0, api_response_1.createErrorResponse)({
            code: err.code,
            message: err.message,
            details: err.details,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        }, { requestId: req.headers['x-request-id'] }));
        return;
    }
    logger_1.logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json((0, api_response_1.createErrorResponse)({
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    }, { requestId: req.headers['x-request-id'] }));
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=error-handler.js.map