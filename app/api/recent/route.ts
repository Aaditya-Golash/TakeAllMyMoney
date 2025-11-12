import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const recent = await sql<{
    handle: string | null;
    amount_cents: number;
    message: string | null;
    created_at: string;
  }>(
    `
    SELECT NULLIF(handle,'') AS handle, amount_cents, message, created_at
    FROM payments
    WHERE status='succeeded' AND public=true
    ORDER BY created_at DESC
    LIMIT 20;
    `
  );

  return NextResponse.json({
    recent: recent.map((r) => ({
      handle: r.handle ?? 'Anonymous',
      amountCents: Number(r.amount_cents || 0),
      message: r.message || '',
      createdAt: r.created_at,
    })),
  });
}
