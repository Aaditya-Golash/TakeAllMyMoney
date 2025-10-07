import React, { Suspense } from 'react';

import { LeaderboardTable } from '@/components/LeaderboardTable';

type Period = '24h' | '7d' | 'all';

type LeaderboardResponse = {
  period: Period;
  top: Array<{ rank: number; handle: string; amountCents: number; count: number }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

const fetchLeaderboard = async (period: Period): Promise<LeaderboardResponse> => {
  const response = await fetch(`${baseUrl}/api/leaderboard?period=${period}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
};

function LeaderboardContent({
  initial,
  allTimeTotal,
}: {
  initial: LeaderboardResponse;
  allTimeTotal: number;
}) {
  'use client';

  const [state, setState] = React.useState<{
    period: Period;
    rows: LeaderboardResponse['top'];
    loading: boolean;
  }>({
    period: initial.period,
    rows: initial.top,
    loading: false,
  });

  const handleSwitch = async (period: Period) => {
    if (state.loading || state.period === period) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/leaderboard?period=${period}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data: LeaderboardResponse = await res.json();
      setState({ period: data.period, rows: data.top, loading: false });
    } catch (error) {
      console.error(error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const todayTotal = initial.top.reduce((sum, row) => sum + row.amountCents, 0);
  const selectedTotal = state.rows.reduce((sum, row) => sum + row.amountCents, 0);

  const formatDollars = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      cents / 100,
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold uppercase tracking-widest">Leaderboard</h1>
          <p className="text-sm uppercase tracking-[0.3em] text-black/60">Money torched intentionally</p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', 'all'] as Period[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => handleSwitch(period)}
              className={`rounded-md border-2 border-black px-4 py-2 font-mono text-sm uppercase tracking-wide transition-colors ${
                state.period === period ? 'bg-royal text-white' : 'bg-parchment hover:bg-mint'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border-2 border-black bg-white p-4 shadow-pixel">
          <p className="text-xs uppercase tracking-[0.3em] text-black/60">Total burned today (24h)</p>
          <p className="text-3xl font-black">{formatDollars(todayTotal)}</p>
        </div>
        <div className="rounded-md border-2 border-black bg-white p-4 shadow-pixel">
          <p className="text-xs uppercase tracking-[0.3em] text-black/60">Selected period ({state.period})</p>
          <p className="text-3xl font-black">{formatDollars(selectedTotal)}</p>
        </div>
        <div className="rounded-md border-2 border-black bg-white p-4 shadow-pixel">
          <p className="text-xs uppercase tracking-[0.3em] text-black/60">All-time bonfire</p>
          <p className="text-3xl font-black">{formatDollars(allTimeTotal)}</p>
        </div>
      </div>

      {state.loading && <p className="font-mono text-sm text-black/60">Fetching fresh flames…</p>}

      <LeaderboardTable rows={state.rows} />
    </div>
  );
}

export default async function LeaderboardPage() {
  const initial = await fetchLeaderboard('24h');
  const allTime = await fetchLeaderboard('all');

  const allTimeTotal = allTime.top.reduce((sum, row) => sum + row.amountCents, 0);

  return (
    <main className="flex flex-1 flex-col gap-8">
      <Suspense fallback={<p className="font-mono text-sm">Loading leaderboard…</p>}>
        <LeaderboardContent initial={initial} allTimeTotal={allTimeTotal} />
      </Suspense>
    </main>
  );
}
