import type Stripe from 'stripe';

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

// Build leaderboard by querying Stripe directly, no database required.
export const getTotals = async (period: Period): Promise<LeaderboardRow[]> => {
  const since = getPeriodWindow(period);
  if (!process.env.STRIPE_SECRET_KEY) {
    // No key configured; return empty so UI can render.
    return [];
  }

  const StripeCtor = (await import('stripe')).default as typeof import('stripe').default;
  const stripe = new StripeCtor(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

  const totals = new Map<string, { amount: number; count: number }>();

  const baseParams: Stripe.PaymentIntentListParams = {
    limit: 100,
    // Do not pass `status` — not a valid filter for list; filter client-side.
    expand: ['data.latest_charge'],
  };
  if (since) {
    baseParams.created = { gte: Math.floor(since.getTime() / 1000) } as any;
  }

  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.paymentIntents.list({ ...baseParams, starting_after: startingAfter });
    for (const pi of page.data) {
      // Only consider succeeded intents
      if ((pi as any).status && (pi as any).status !== 'succeeded') continue;
      let amount = (pi.amount_received ?? pi.amount ?? 0) as number;

      const lc = pi.latest_charge as unknown;
      const refunded = typeof lc === 'object' && lc !== null && 'refunded' in (lc as any) ? (lc as any).refunded : false;
      const amountRefunded = typeof lc === 'object' && lc !== null && 'amount_refunded' in (lc as any) ? (lc as any).amount_refunded : 0;
      if (refunded || amountRefunded > 0) {
        amount -= Number(amountRefunded) || 0;
      }
      if (!amount || amount <= 0) continue;

      const handle = pi.metadata?.handle?.trim().toLowerCase() || 'Anonymous';
      const current = totals.get(handle) || { amount: 0, count: 0 };
      current.amount += amount;
      current.count += 1;
      totals.set(handle, current);
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1].id;

    // Safety: if period is bounded and the last item is older than window, stop.
    if (since) {
      const last = page.data[page.data.length - 1];
      if (last && last.created < Math.floor(since.getTime() / 1000)) break;
    }
  }

  const rows: LeaderboardRow[] = Array.from(totals.entries()).map(([handle, v]) => ({
    handle,
    amountCents: Math.round(v.amount),
    count: v.count,
  }));

  rows.sort((a, b) => b.amountCents - a.amountCents);
  return rows.slice(0, 100);
};
