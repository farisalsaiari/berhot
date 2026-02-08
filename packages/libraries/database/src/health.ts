import { getPool } from './connection';

export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  details?: string;
}> {
  const start = Date.now();
  try {
    const pool = getPool();
    const result = await pool.query('SELECT 1 as health');
    const latencyMs = Date.now() - start;

    return {
      status: result.rows[0]?.health === 1 ? 'healthy' : 'unhealthy',
      latencyMs,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      details: (error as Error).message,
    };
  }
}
