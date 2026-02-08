import { type Request, type Response, type NextFunction } from 'express';

import { UnauthorizedError, TenantNotFoundError } from '../errors/http-errors';
import { logger } from '../logging/logger';

export interface TenantContextOptions {
  headerName?: string;
  required?: boolean;
}

export function tenantContextMiddleware(options: TenantContextOptions = {}) {
  const { headerName = 'x-tenant-id', required = true } = options;

  return (req: Request, _res: Response, next: NextFunction) => {
    // Priority: 1. JWT token, 2. Header, 3. Subdomain
    let tenantId = req.user?.tenantId ?? req.headers[headerName] as string;

    if (!tenantId) {
      // Try subdomain resolution: {tenant}.berhot.com
      const host = req.hostname;
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        tenantId = subdomain;
      }
    }

    if (!tenantId && required) {
      return next(new UnauthorizedError('Tenant context required'));
    }

    if (tenantId) {
      req.tenantId = tenantId;
      logger.debug('Tenant context set', { tenantId, path: req.path });
    }

    next();
  };
}

/**
 * Ensures the authenticated user belongs to the requested tenant.
 * Prevents cross-tenant data access.
 */
export function tenantIsolationMiddleware() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !req.tenantId) {
      return next();
    }

    // Super admins can access any tenant
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (req.user.tenantId !== req.tenantId) {
      logger.warn('Cross-tenant access attempt', {
        userId: req.user.userId,
        userTenant: req.user.tenantId,
        requestedTenant: req.tenantId,
        path: req.path,
      });
      return next(new TenantNotFoundError(req.tenantId));
    }

    next();
  };
}
