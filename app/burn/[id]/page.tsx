import { sql } from '@/lib/db';
import { getTierForAmount } from '@/lib/tiers';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type PaymentRow = {
  id: string;
  handle: string | null;
  amount_cents: number;
  message: string | null;
  created_at: string;
};

async function fetchPayment(id: string) {
  const rows = await sql<PaymentRow>(
    `
    SELECT id, COALESCE(NULLIF(handle,''),'anon') AS handle,
           amount_cents, message, created_at
    FROM payments
    WHERE id = $1 AND status = 'succeeded'
    LIMIT 1;
  `,
    [id]
  );
  return rows[0] || null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const payment = await fetchPayment(params.id);
  if (!payment) {
    return {
      title: 'Unknown burn',
      description: 'This burn could not be found.',
    };
  }
  const amount = (payment.amount_cents / 100).toFixed(2);
  const handle = payment.handle || 'anon';
  const description = `${handle} threw $${amount} on Take All My Money.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''}/burn/${payment.id}`;
  return {
    title: `${handle} burned $${amount}`,
    description,
    openGraph: {
      title: `${handle} burned $${amount}`,
      description,
      url,
    },
    twitter: {
      card: 'summary',
      title: `${handle} burned $${amount}`,
      description,
    },
  };
}

export default async function BurnDetailsPage({ params }: { params: { id: string } }) {
  const payment = await fetchPayment(params.id);
  if (!payment) notFound();

  const amount = payment.amount_cents / 100;
  const tier = getTierForAmount(amount) || { name: 'Unknown tier' };
  const createdAt = new Date(payment.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <main className="max-w-2xl mx-auto mt-10 pixel bg-white/90 p-6 space-y-4">
      <h1 className="text-2xl font-bold">Burn #{payment.id}</h1>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-black/20 pb-2">
          <dt className="font-semibold">Handle</dt>
          <dd>{payment.handle || 'anon'}</dd>
        </div>
        <div className="flex justify-between border-b border-black/20 pb-2">
          <dt className="font-semibold">Amount</dt>
          <dd>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd>
        </div>
        <div className="flex justify-between border-b border-black/20 pb-2">
          <dt className="font-semibold">Tier</dt>
          <dd>{tier.name}</dd>
        </div>
        <div className="border-b border-black/20 pb-2">
          <dt className="font-semibold mb-1">Message</dt>
          <dd className="text-black/80">{payment.message?.trim() || 'No message left.'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-semibold">Timestamp</dt>
          <dd>{createdAt}</dd>
        </div>
      </dl>
    </main>
  );
}
