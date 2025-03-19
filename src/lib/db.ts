import { Pool, PoolConfig, Client } from 'pg';
import { stackServerApp } from '@/stack';

let pool: Pool | null = null;

function getConnectionConfig(isAuthenticated = false): PoolConfig {
  const connectionString = isAuthenticated
    ? process.env.NEON_DATABASE_AUTHENTICATED_URL
    : process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error(`Missing ${isAuthenticated ? 'authenticated ' : ''}database URL`);
  }

  return {
    connectionString,
    ssl: true,
  };
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getConnectionConfig(false));
  }
  return pool;
}

// For authenticated connections, we'll use a direct client instead of pool
// This allows us to set session parameters that aren't supported in pooled connections
async function getAuthenticatedClient(): Promise<Client> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    throw new Error('No authenticated user found');
  }
  
  const client = new Client(getConnectionConfig(true));
  await client.connect();
  
  // Set the user ID as a session parameter for RLS
  await client.query(`SELECT set_config('app.current_user_id', $1, false)`, [stackUser.id]);
  
  return client;
}

/**
 * Executes a SQL query and returns the results
 */
export async function query<T = any>(
  sql: string,
  params: any[] = [],
  options: { useAuthenticated?: boolean } = {}
): Promise<T[]> {
  if (options.useAuthenticated) {
    const client = await getAuthenticatedClient();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      await client.end();
    }
  } else {
    const client = await getPool().connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

/**
 * Executes a SQL query and returns a single row
 */
export async function queryOne<T = any>(
  sql: string,
  params: any[] = [],
  options: { useAuthenticated?: boolean } = {}
): Promise<T | null> {
  const rows = await query<T>(sql, params, options);
  return rows[0] || null;
}

/**
 * Executes a transaction with multiple SQL queries
 */
export async function transaction<T = any>(
  callback: (client: any) => Promise<T>,
  options: { useAuthenticated?: boolean } = {}
): Promise<T> {
  if (options.useAuthenticated) {
    const client = await getAuthenticatedClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      await client.end();
    }
  } else {
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
}

// Helper to determine if we should use authenticated connection
export async function shouldUseAuthenticatedConnection(): Promise<boolean> {
  try {
    const stackUser = await stackServerApp.getUser();
    return !!stackUser;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}
