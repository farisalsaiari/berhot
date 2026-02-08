import { type Pool, type PoolClient } from 'pg';

/**
 * Sets the tenant context for Row-Level Security (RLS) in PostgreSQL.
 * This must be called at the beginning of every database transaction
 * to ensure tenant isolation via RLS policies.
 *
 * PostgreSQL function: SET LOCAL berhot.current_tenant_id = '<tenant_id>';
 */
export async function setTenantContext(
  client: PoolClient,
  tenantId: string,
): Promise<void> {
  await client.query("SELECT set_config('berhot.current_tenant_id', $1, true)", [tenantId]);
}

/**
 * Clears the tenant context after a transaction completes.
 */
export async function clearTenantContext(client: PoolClient): Promise<void> {
  await client.query("SELECT set_config('berhot.current_tenant_id', '', true)");
}

/**
 * Wraps a database operation with tenant context.
 * Ensures RLS policies are applied for the given tenant.
 */
export async function withTenantContext<T>(
  pool: Pool,
  tenantId: string,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await setTenantContext(client, tenantId);

    const result = await operation(client);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await clearTenantContext(client);
    client.release();
  }
}

/**
 * Creates a tenant-scoped query builder that automatically
 * includes tenant_id in WHERE clauses.
 */
export function createTenantScopedQuery(tenantId: string) {
  return {
    select: (table: string, columns = '*', conditions: Record<string, unknown> = {}) => {
      const allConditions = { ...conditions, tenant_id: tenantId };
      const whereClauses = Object.keys(allConditions)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(' AND ');
      const values = Object.values(allConditions);
      return {
        text: `SELECT ${columns} FROM ${table} WHERE ${whereClauses}`,
        values,
      };
    },
    insert: (table: string, data: Record<string, unknown>) => {
      const allData = { ...data, tenant_id: tenantId };
      const columns = Object.keys(allData).join(', ');
      const placeholders = Object.keys(allData).map((_, i) => `$${i + 1}`).join(', ');
      return {
        text: `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values: Object.values(allData),
      };
    },
  };
}
