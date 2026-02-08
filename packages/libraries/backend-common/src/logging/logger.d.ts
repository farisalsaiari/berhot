import winston from 'winston';
export declare const logger: winston.Logger;
export declare function createServiceLogger(serviceName: string, meta?: Record<string, unknown>): winston.Logger;
export declare function createTenantLogger(serviceName: string, tenantId: string): winston.Logger;
//# sourceMappingURL=logger.d.ts.map