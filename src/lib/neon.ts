import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Configure neon to use WebSockets for better performance
neonConfig.webSocketConstructor = globalThis.WebSocket;
neonConfig.useSecureWebSocket = true;
neonConfig.fetchConnectionCache = true;

// Get connection string from environment variable
// Try Neon URL first, then fall back to Supabase URL if available
let connectionString = process.env.NEON_DATABASE_URL;

// If no Neon URL is provided, try to construct one from Supabase URL
if (!connectionString && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '');
  connectionString = `postgresql://postgres:postgres@${supabaseHost}:5432/postgres`;
}

if (!connectionString) {
  throw new Error('Missing database connection string. Please set NEON_DATABASE_URL in your .env.local file');
}

// Create SQL executor for serverless environments
export const sql = neon(connectionString);

// Create connection pool for server environments
export const pool = new Pool({ connectionString });

// Helper function to query the database
export async function query<T>(text: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql(text, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
