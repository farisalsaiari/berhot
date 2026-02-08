import { type Request, type Response, type NextFunction } from 'express';

import { resolveTenantId, type TenantResolverConfig } from './tenant-resolver';

export interface TenantMiddlewareOptions extends Partial<TenantResolverConfig> {
  required?: boolean;
  cache?: TenantCache;
}

export interface TenantCache {
  get(tenantId: string): Promise<TenantInfo | null>;
  set(tenantId: string, info: TenantInfo, ttl?: number): Promise<void>;
}

export interface TenantInfo {
  id: string;
  name: string;
  status: string;
  plan: string;
  products: string[];
}

export function tenantMiddleware(options: TenantMiddlewareOptions = {}) {
  const { required = true, cache } = options;

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const tenantId = resolveTenantId(req, {
        strategies: options.strategies || ['jwt', 'header', 'subdomain'],
        headerName: options.headerName,
      });

      if (!tenantId) {
        if (required) {
          return next(new Error('Tenant context required'));
        }
        return next();
      }

      // Check cache for tenant info
      if (cache) {
        const tenantInfo = await cache.get(tenantId);
        if (tenantInfo) {
          if (tenantInfo.status === 'suspended') {
            return next(new Error(`Tenant ${tenantId} is suspended`));
          }
          (req as any).tenantInfo = tenantInfo;
        }
      }

      (req as any).tenantId = tenantId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if tenant has access to a specific product.
 */
export function requireProduct(productId: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const tenantInfo = (req as any).tenantInfo as TenantInfo | undefined;
    if (!tenantInfo) {
      return next();
    }

    if (!tenantInfo.products.includes(productId)) {
      return next(new Error(`Tenant not entitled to product: ${productId}`));
    }

    next();
  };
}
