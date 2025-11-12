const { Pool } = require('pg');

(async () => {
  const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  const ddl = `
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 100),
    currency TEXT NOT NULL DEFAULT 'usd',
    handle TEXT,
    message TEXT,
    status TEXT NOT NULL,
    public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `;

  await pool.query(ddl);
  console.log('✅ DB ready (payments table exists).');
  await pool.end();
  process.exit(0);
})().catch(async (e) => {
  console.error('DB init failed:', e);
  process.exit(1);
});

