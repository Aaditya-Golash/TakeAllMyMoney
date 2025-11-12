import { Pool } from 'pg';

const isLocal =
  process.env.DATABASE_URL?.includes('localhost') ||
  process.env.DATABASE_URL?.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

export async function sql<T = any>(text: string, params: any[] = []) {
  const res = await pool.query<T>(text, params);
  return res.rows as unknown as T[];
}

