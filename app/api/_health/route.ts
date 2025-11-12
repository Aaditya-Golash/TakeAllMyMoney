import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    stripeKey: !!process.env.STRIPE_SECRET_KEY,
    webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    dbUrl: !!process.env.DATABASE_URL,
  });
}

