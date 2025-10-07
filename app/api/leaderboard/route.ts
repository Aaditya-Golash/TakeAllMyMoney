import { NextRequest, NextResponse } from 'next/server';

import { getTotals } from '@/lib/leaderboard';

type Period = '24h' | '7d' | 'all';

export const runtime = 'nodejs';

const isValidPeriod = (value: string): value is Period => ['24h', '7d', 'all'].includes(value);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get('period') ?? '24h';
  const period: Period = isValidPeriod(periodParam) ? periodParam : '24h';

  const totals = await getTotals(period);

  const top = totals.map((row, index) => ({
    rank: index + 1,
    handle: row.handle || 'Anonymous',
    amountCents: row.amountCents,
    count: row.count,
  }));

  return NextResponse.json({ period, top });
}
