import { NextResponse } from 'next/server';
import { getTotals } from '@/lib/leaderboard';

type Period = '24h' | '7d' | 'all';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as Period) || '24h';

  try {
    const rows = await getTotals(period);
    const top = rows.map((r, i) => ({
      rank: i + 1,
      handle: r.handle || 'Anonymous',
      amountCents: Number(r.amountCents || 0),
      count: Number(r.count || 0),
    }));
    return NextResponse.json({ period, top });
  } catch (err) {
    console.error('leaderboard error:', err);
    // Fail soft with empty data so the UI still renders
    return NextResponse.json({ period, top: [] });
  }
}
