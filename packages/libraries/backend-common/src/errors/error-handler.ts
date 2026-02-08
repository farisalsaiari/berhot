import { type Request, type Response, type NextFunction } from 'express';

import { BaseError } from './base-error';
import { createErrorResponse } from '../types/api-response';
import { logger } from '../logging/logger';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof BaseError) {
    if (!err.isOperational) {
      logger.error('Non-operational error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    }

    res.status(err.statusCode).json(
      createErrorResponse(
        {
          code: err.code,
          message: err.message,
          details: err.details,
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
        { requestId: req.headers['x-request-id'] as string },
      ),
    );
    return;
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json(
    createErrorResponse(
      {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
      { requestId: req.headers['x-request-id'] as string },
    ),
  );
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
