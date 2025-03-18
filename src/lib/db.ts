import { Pool } from 'pg';

// Initialize connection pool
let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.NEON_DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('Database connection string not found. Please set NEON_DATABASE_URL in your environment variables.');
    }
    
    pool = new Pool({
      connectionString,
      // Recommended settings for serverless environments
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  
  return pool;
}

/**
 * Executes a SQL query and returns the results
 */
export async function query<T = any>(
  sql: string, 
  params: any[] = []
): Promise<T[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Executes a SQL query and returns a single row
 */
export async function queryOne<T = any>(
  sql: string, 
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Executes a transaction with multiple SQL queries
 */
export async function transaction<T = any>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
