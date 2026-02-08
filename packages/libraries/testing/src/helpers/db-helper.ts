import { type Pool } from 'pg';

export async function setupTestDatabase(pool: Pool): Promise<void> {
  await pool.query('BEGIN');
  await pool.query("SELECT set_config('berhot.current_tenant_id', 'test-tenant', true)");
}

export async function teardownTestDatabase(pool: Pool): Promise<void> {
  await pool.query('ROLLBACK');
}

export async function truncateAllTables(pool: Pool, tables: string[]): Promise<void> {
  for (const table of tables) {
    await pool.query(`TRUNCATE TABLE ${table} CASCADE`);
  }
}

export function createTestPool(): Pool {
  const { Pool } = require('pg');
  return new Pool({
    connectionString: process.env.TEST_DATABASE_URL || 'postgresql://berhot:berhot_dev_password@localhost:5433/berhot_test',
    max: 5,
  });
}
