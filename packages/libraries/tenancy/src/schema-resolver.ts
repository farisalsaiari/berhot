/**
 * Schema resolver for multi-tenant database access.
 * Supports both RLS-based (single schema) and schema-per-tenant strategies.
 *
 * Berhot uses RLS as the primary strategy, with schema-per-tenant
 * available for enterprise customers requiring stronger isolation.
 */

export type IsolationStrategy = 'rls' | 'schema' | 'database';

export interface SchemaResolverConfig {
  strategy: IsolationStrategy;
  defaultSchema?: string;
  schemaPrefix?: string;
}

const defaultConfig: SchemaResolverConfig = {
  strategy: 'rls',
  defaultSchema: 'public',
  schemaPrefix: 'tenant_',
};

export function resolveSchema(tenantId: string, config = defaultConfig): string {
  switch (config.strategy) {
    case 'rls':
      return config.defaultSchema || 'public';

    case 'schema':
      return `${config.schemaPrefix}${tenantId}`;

    case 'database':
      return config.defaultSchema || 'public';

    default:
      return 'public';
  }
}

export function resolveDatabaseUrl(
  tenantId: string,
  baseUrl: string,
  config = defaultConfig,
): string {
  if (config.strategy === 'database') {
    const url = new URL(baseUrl);
    url.pathname = `/berhot_${tenantId}`;
    return url.toString();
  }
  return baseUrl;
}

export function getSearchPath(tenantId: string, config = defaultConfig): string {
  const schema = resolveSchema(tenantId, config);
  return schema === 'public' ? 'public' : `${schema}, public`;
}
