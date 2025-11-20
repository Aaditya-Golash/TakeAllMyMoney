import { sql } from '@/lib/db';
import { getTierForAmount } from '@/lib/tiers';

type BurnerRow = {
  handle: string | null;
  total_cents: string;
  first_seen: string;
};

async function fetchBurners() {
  return sql<BurnerRow>(
    `
    WITH clean AS (
      SELECT COALESCE(NULLIF(handle,''),'anon') AS handle_clean,
             amount_cents,
             created_at
      FROM payments
      WHERE status = 'succeeded' AND public = true
    )
    SELECT handle_clean AS handle,
           SUM(amount_cents)::bigint AS total_cents,
           MIN(created_at) AS first_seen
    FROM clean
    GROUP BY handle_clean
    ORDER BY MIN(created_at) ASC
    LIMIT 100;
  `
  );
}

export const dynamic = 'force-dynamic';

export default async function HallOfFlamePage() {
  const burners = await fetchBurners();

  return (
    <main className="max-w-4xl mx-auto mt-10 space-y-4">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-pixel">Hall of Flame</h1>
        <p className="text-sm text-black/70">
          The first 100 legends to burn, ordered by their earliest throw.
        </p>
      </header>

      {burners.length === 0 ? (
        <p className="pixel bg-white/80 p-4 text-center">No burns yet. Be the first.</p>
      ) : (
        <div className="pixel bg-white/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black/5 border-b border-black/20">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Handle</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-left">Tier</th>
                <th className="p-3 text-left">First Burn</th>
              </tr>
            </thead>
            <tbody>
              {burners.map((row, index) => {
                const amount = Number(row.total_cents || 0) / 100;
                const tier = getTierForAmount(amount) || { name: 'No tier' };
                const date = new Date(row.first_seen).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={`${row.handle}-${index}`} className="border-b border-black/10">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{row.handle || 'anon'}</td>
                    <td className="p-3 text-right">
                      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 border border-black/40 text-xs">
                        {tier.name}
                      </span>
                    </td>
                    <td className="p-3">{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
