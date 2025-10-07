import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { stripe } from '@/lib/stripe';

const rateLimits = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

const requestSchema = z.object({
  amount: z.number().int().min(1, 'Minimum payment is $1'),
  message: z.string().max(200).optional(),
  handle: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .transform((val) => val.toLowerCase())
    .optional(),
});

const sanitizeMessage = (input?: string | null) => {
  if (!input) return undefined;
  const withoutUrls = input.replace(/https?:\/\/\S+/gi, '[link]');
  return withoutUrls.trim().slice(0, 200);
};

const ensureSameOrigin = (req: NextRequest) => {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const allowed = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  return allowed ? origin.replace(/\/$/, '') === allowed : false;
};

const checkRateLimit = (identifier: string) => {
  const now = Date.now();
  const current = rateLimits.get(identifier);
  if (!current || current.reset < now) {
    rateLimits.set(identifier, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }
  current.count += 1;
  return true;
};

export async function POST(req: NextRequest) {
  if (!ensureSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.ip ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
  }

  const { amount, handle, message } = parseResult.data;

  const sanitizedMessage = sanitizeMessage(message);
  const amountCents = Math.round(amount * 100);
  if (amountCents < 100) {
    return NextResponse.json({ error: 'Minimum payment is $1' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json({ error: 'Site URL not configured' }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Throw Money',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        message: sanitizedMessage ?? '',
        handle: handle ?? '',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
