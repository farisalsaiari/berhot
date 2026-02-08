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

export function createSuccessResponse<T>(data: T, meta?: Partial<ResponseMeta>): ApiResponse<T> {
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

export function createErrorResponse(error: ApiError, meta?: Partial<ResponseMeta>): ApiResponse {
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
