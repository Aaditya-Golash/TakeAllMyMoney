import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') as string;
  const buf = await req.arrayBuffer();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const amount = pi.amount_received ?? pi.amount ?? 0;
    const currency = pi.currency ?? 'usd';
    const handle = (pi.metadata?.handle || '').trim() || null;
    const message = (pi.metadata?.message || '').trim() || null;

    await sql(
      `INSERT INTO payments (id, amount_cents, currency, handle, message, status, public, created_at)
       VALUES ($1,$2,$3,$4,$5,'succeeded',true, NOW())
       ON CONFLICT (id) DO UPDATE SET status='succeeded', amount_cents=EXCLUDED.amount_cents, handle=EXCLUDED.handle, message=EXCLUDED.message`,
      [pi.id, amount, currency, handle, message]
    );
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (piId) {
      await sql(`UPDATE payments SET status='refunded' WHERE id=$1`, [piId]);
    }
  }

  return NextResponse.json({ received: true });
}
