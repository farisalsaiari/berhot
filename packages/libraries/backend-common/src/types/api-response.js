"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
function createSuccessResponse(data, meta) {
    return {
        success: true,
        data,
        meta: {
            requestId: meta?.requestId ?? '',
            timestamp: new Date().toISOString(),
            version: meta?.version ?? '1.0',
            ...meta,
        },
    };
}
function createErrorResponse(error, meta) {
    return {
        success: false,
        error,
        meta: {
            requestId: meta?.requestId ?? '',
            timestamp: new Date().toISOString(),
            version: meta?.version ?? '1.0',
            ...meta,
        },
    };
}
//# sourceMappingURL=api-response.js.map