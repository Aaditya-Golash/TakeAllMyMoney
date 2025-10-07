import { prisma } from './db';

type Period = '24h' | '7d' | 'all';

type LeaderboardRow = {
  handle: string;
  amountCents: number;
  count: number;
};

const getPeriodWindow = (period: Period) => {
  const now = new Date();
  if (period === '24h') {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  if (period === '7d') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return null;
};

export const getTotals = async (period: Period): Promise<LeaderboardRow[]> => {
  const since = getPeriodWindow(period);

  const payments = await prisma.payment.groupBy({
    by: ['userId'],
    _sum: {
      amountCents: true,
    },
    _count: {
      _all: true,
    },
    where: {
      status: 'succeeded',
      public: true,
      createdAt: since ? { gte: since } : undefined,
    },
    orderBy: {
      _sum: {
        amountCents: 'desc',
      },
    },
    take: 100,
  });

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: payments
          .map((p) => p.userId)
          .filter((id): id is string => Boolean(id)),
      },
    },
  });

  const userMap = new Map(users.map((user) => [user.id, user.handle]));

  const anonymous = await prisma.payment.aggregate({
    _sum: { amountCents: true },
    _count: { _all: true },
    where: {
      status: 'succeeded',
      public: true,
      createdAt: since ? { gte: since } : undefined,
      userId: null,
    },
  });

  const rows: LeaderboardRow[] = [];

  for (const payment of payments) {
    const amount = payment._sum.amountCents ?? 0;
    if (amount <= 0) continue;
    const handle = payment.userId ? userMap.get(payment.userId) ?? 'Anonymous' : 'Anonymous';
    rows.push({
      handle,
      amountCents: amount,
      count: payment._count._all,
    });
  }

  const anonymousTotal = anonymous._sum.amountCents ?? 0;
  if (anonymousTotal > 0) {
    rows.push({
      handle: 'Anonymous',
      amountCents: anonymousTotal,
      count: anonymous._count._all,
    });
  }

  rows.sort((a, b) => b.amountCents - a.amountCents);

  return rows.slice(0, 100);
};
