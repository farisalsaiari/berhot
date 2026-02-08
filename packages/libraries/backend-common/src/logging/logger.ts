import winston from 'winston';

import { consoleFormat, jsonFormat } from './formats';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'unknown',
  },
  transports: [
    new winston.transports.Console({
      format: isProduction ? jsonFormat : consoleFormat,
    }),
  ],
});

export function createServiceLogger(serviceName: string, meta?: Record<string, unknown>) {
  return logger.child({ service: serviceName, ...meta });
}

export function createTenantLogger(serviceName: string, tenantId: string) {
  return logger.child({ service: serviceName, tenantId });
}
