const { Pool } = require('pg');
const Stripe = require('stripe');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const isLocal =
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

async function main() {
  const { rows } = await pool.query(
    `SELECT id, handle, message FROM payments WHERE status = 'succeeded' AND COALESCE(handle, '') <> ''`
  );

  console.log(`Updating ${rows.length} payment intents on Stripe...`);

  for (const row of rows) {
    try {
      await stripe.paymentIntents.update(row.id, {
        metadata: {
          handle: row.handle || '',
          message: row.message || '',
        },
      });
      console.log(`Updated ${row.id}`);
    } catch (err) {
      console.error(`Failed to update ${row.id}:`, err.message);
    }
  }

  await pool.end();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
