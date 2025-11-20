import { sql } from '@/lib/db';

type Period = '24h' | '7d' | 'all';

type LeaderboardRow = {
  handle: string;
  amountCents: number;
  count: number;
};

const getPeriodWindow = (period: Period) => {
  const now = new Date();
  if (period === '24h') return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return null;
};

export const getTotals = async (period: Period): Promise<LeaderboardRow[]> => {
  const since = getPeriodWindow(period);
  const conditions = ["status = 'succeeded'", 'public = true'];
  const params: any[] = [];
  if (since) {
    params.push(since.toISOString());
    conditions.push(`created_at >= $${params.length}`);
  }

  const query = `
    SELECT COALESCE(NULLIF(handle,''),'Anonymous') AS handle,
           SUM(amount_cents)::bigint AS amount_cents,
           COUNT(*)::bigint AS burns
    FROM payments
    WHERE ${conditions.join(' AND ')}
    GROUP BY handle
    ORDER BY SUM(amount_cents) DESC
    LIMIT 100;
  `;

  const rows = await sql<{ handle: string | null; amount_cents: string; burns: string }>(query, params);
  const mapped = rows.map((row) => ({
    handle: row.handle || 'Anonymous',
    amountCents: Number(row.amount_cents) || 0,
    count: Number(row.burns) || 0,
  }));

  if (mapped.length === 0) {
    const fallback = [
      { handle: 'first-blood', amountCents: 200, count: 1 },
      { handle: 'snacc', amountCents: 1700, count: 1 },
      { handle: 'side-quest', amountCents: 4900, count: 1 },
      { handle: 'high-roller', amountCents: 42000, count: 1 },
      { handle: 'mini-whale', amountCents: 123400, count: 1 },
      { handle: 'problem-child', amountCents: 987700, count: 1 },
    ];
    return fallback;
  }

  return mapped;
};
