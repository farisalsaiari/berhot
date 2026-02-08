import { type Pool, type PoolClient } from 'pg';

import { getPool } from './connection';

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
  pool?: Pool,
): Promise<T> {
  const db = pool || getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function withTenantTransaction<T>(
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>,
  pool?: Pool,
): Promise<T> {
  return withTransaction(async (client) => {
    await client.query("SELECT set_config('berhot.current_tenant_id', $1, true)", [tenantId]);
    return fn(client);
  }, pool);
}
