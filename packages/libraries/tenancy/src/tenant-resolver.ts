import { type Request } from 'express';

export type TenantResolutionStrategy = 'header' | 'subdomain' | 'path' | 'jwt';

export interface TenantResolverConfig {
  strategies: TenantResolutionStrategy[];
  headerName?: string;
  pathPrefix?: string;
}

const defaultConfig: TenantResolverConfig = {
  strategies: ['jwt', 'header', 'subdomain'],
  headerName: 'x-tenant-id',
};

/**
 * Resolves tenant ID from various sources in priority order.
 */
export function resolveTenantId(req: Request, config = defaultConfig): string | null {
  for (const strategy of config.strategies) {
    const tenantId = resolveByStrategy(req, strategy, config);
    if (tenantId) {
      return tenantId;
    }
  }
  return null;
}

function resolveByStrategy(
  req: Request,
  strategy: TenantResolutionStrategy,
  config: TenantResolverConfig,
): string | null {
  switch (strategy) {
    case 'jwt':
      return (req as any).user?.tenantId ?? null;

    case 'header':
      return (req.headers[config.headerName || 'x-tenant-id'] as string) ?? null;

    case 'subdomain': {
      const host = req.hostname;
      const parts = host.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        if (subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'app') {
          return subdomain;
        }
      }
      return null;
    }

    case 'path': {
      const prefix = config.pathPrefix || '/t/';
      if (req.path.startsWith(prefix)) {
        const tenantSlug = req.path.split('/')[2];
        return tenantSlug || null;
      }
      return null;
    }

    default:
      return null;
  }
}
