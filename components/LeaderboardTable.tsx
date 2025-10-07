import { Fragment } from 'react';

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const rankEmojis = ['🥇', '🥈', '🥉'];

type LeaderRow = {
  rank: number;
  handle: string;
  amountCents: number;
  count: number;
};

type LeaderboardTableProps = {
  rows: LeaderRow[];
};

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-md border-2 border-black bg-white shadow-pixel">
      <table className="min-w-full divide-y-2 divide-black/20">
        <thead className="bg-mint/60">
          <tr className="text-left text-xs uppercase tracking-widest text-black">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Handle</th>
            <th className="px-4 py-3 text-right">Total Burned</th>
            <th className="px-4 py-3 text-right">Burns</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10 bg-white text-sm">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-black/70">
                No burns yet. Be the first to torch some cash.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <Fragment key={`${row.rank}-${row.handle}`}>
                <tr className="hover:bg-parchment/60">
                  <td className="px-4 py-3 font-mono font-bold text-black">
                    {rankEmojis[row.rank - 1] ?? `#${row.rank}`}
                  </td>
                  <td className="px-4 py-3 text-black">{row.handle || 'Anonymous'}</td>
                  <td className="px-4 py-3 text-right font-mono text-black">
                    {formatCurrency(row.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-black">{row.count}</td>
                </tr>
              </Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
