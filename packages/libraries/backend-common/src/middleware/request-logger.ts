import { type Request, type Response, type NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../logging/logger';

export function requestLoggerMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
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
        logger.error('Request failed', logData);
      } else if (res.statusCode >= 400) {
        logger.warn('Request error', logData);
      } else {
        logger.info('Request completed', logData);
      }
    });

    next();
  };
}
