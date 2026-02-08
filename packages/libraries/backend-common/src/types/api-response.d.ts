export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
}
export interface ResponseMeta {
    requestId: string;
    timestamp: string;
    version: string;
    pagination?: PaginationMeta;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare function createSuccessResponse<T>(data: T, meta?: Partial<ResponseMeta>): ApiResponse<T>;
export declare function createErrorResponse(error: ApiError, meta?: Partial<ResponseMeta>): ApiResponse;
//# sourceMappingURL=api-response.d.ts.map