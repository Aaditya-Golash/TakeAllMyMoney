import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

const sanitizeMessage = (input?: string | null) => {
  if (!input) return undefined;
  const withoutUrls = input.replace(/https?:\/\/\S+/gi, '[link]');
  return withoutUrls.trim().slice(0, 200);
};

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const amountCents = paymentIntent.amount_received ?? paymentIntent.amount ?? 0;
        const currency = paymentIntent.currency ?? 'usd';
        const handle = paymentIntent.metadata?.handle?.trim().toLowerCase() || undefined;
        const message = sanitizeMessage(paymentIntent.metadata?.message);

        if (!amountCents || amountCents <= 0) {
          break;
        }

        let userId: string | null = null;
        if (handle) {
          const user = await prisma.user.upsert({
            where: { handle },
            create: { handle },
            update: {},
          });
          userId = user.id;
        }

        await prisma.payment.upsert({
          where: { stripePaymentIntent: paymentIntent.id },
          update: {
            amountCents,
            currency,
            message,
            status: 'succeeded',
            userId: userId ?? undefined,
          },
          create: {
            amountCents,
            currency,
            message,
            status: 'succeeded',
            stripePaymentIntent: paymentIntent.id,
            userId: userId ?? undefined,
          },
        });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (paymentIntentId) {
          await prisma.payment.updateMany({
            where: { stripePaymentIntent: paymentIntentId },
            data: { status: 'refunded' },
          });
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook', error);
    return NextResponse.json({ error: 'Webhook handling error' }, { status: 500 });
  }
}
