import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { amount, message, handle } = await req.json();
    const cents = Math.floor(Number(amount) * 100);

    if (!Number.isFinite(cents)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (cents < 200) {
      return NextResponse.json({ error: 'Minimum is $2' }, { status: 400 });
    }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json({ error: 'Server is missing NEXT_PUBLIC_SITE_URL' }, { status: 500 });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured on the server' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Throw money' },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        handle: String(handle || ''),
        message: String(message || ''),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/success?amount=${Math.floor(cents/100)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}`,
    });

    if (!session?.url) {
      return NextResponse.json({ error: 'Stripe session not created' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('create-checkout-session error:', err);
    const msg = err?.message || 'Unexpected server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
