"use client";
import { useEffect, useMemo, useState } from 'react';
import { getTierForAmount } from '@/lib/tiers';

type Period = '24h' | '7d' | 'all';
type Row = { rank: number; handle: string | null; amountCents: number; count: number };

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>('24h');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then(r => r.json()).then(d => setRows(d.top || []))
      .finally(() => setLoading(false));
  }, [period]);

  const total = useMemo(() => rows.reduce((s, r) => s + r.amountCents, 0), [rows]);

  return (
    <section id="board" className="mt-14">
      <div className="flex gap-2 mb-3">
        {(['24h', '7d', 'all'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-2 rounded border ${period === p ? 'bg-ink text-white' : 'bg-white/80'}`}>
            {p.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="pixel bg-white/80">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-ink bg-black/5">
              <th className="text-left p-3">Rank</th>
              <th className="text-left p-3">Handle</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Burns</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-black/10">
                    <td className="p-3"><div className="h-4 w-8 bg-black/10 animate-pulse" /></td>
                    <td className="p-3"><div className="h-4 w-32 bg-black/10 animate-pulse" /></td>
                    <td className="p-3 text-right"><div className="h-4 w-20 bg-black/10 animate-pulse ml-auto" /></td>
                    <td className="p-3 text-right"><div className="h-4 w-10 bg-black/10 animate-pulse ml-auto" /></td>
                  </tr>
                ))}
              </>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={4} className="p-3">No burns yet — be first!</td></tr>
            )}
            {rows.map(r => {
              const tier = getTierForAmount(r.amountCents / 100);
              return (
                <tr key={r.rank} className="border-t border-black/20">
                  <td className="p-3">{r.rank}</td>
                  <td className="p-3">{r.handle || 'Anonymous'}</td>
                  <td className="p-3 text-right">{'$' + (r.amountCents / 100).toLocaleString()}</td>
                  <td className="p-3 text-right">{r.count}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink bg-black/5">
              <td className="p-3" colSpan={2}><strong>Total</strong></td>
              <td className="p-3 text-right"><strong>{'$' + (total / 100).toLocaleString()}</strong></td>
              <td className="p-3 text-right">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}


