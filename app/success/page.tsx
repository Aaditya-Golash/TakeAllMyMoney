"use client";
import { Suspense, useEffect, useMemo, useState } from 'react';
import PixelButton from '@/components/PixelButton';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const search = useSearchParams();
  const amount = useMemo(() => parseInt(search.get('amount') || '100', 10) || 100, [search]);
  const [intensity, setIntensity] = useState(10);

  useEffect(() => {
    setIntensity(Math.min(Math.floor(amount / 100) + 5, 50));
  }, [amount]);

  const drops = useMemo(() => {
    return Array.from({ length: intensity }).map((_, i) => ({
      id: i,
      leftPct: Math.floor(Math.random() * 100),
      delay: i * 0.2,
      duration: 3 + Math.random() * 2,
    }));
  }, [intensity]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none z-0">
        {drops.map((d) => (
          <div
            key={d.id}
            className="absolute text-3xl animate-burn-cash"
            style={{ left: `${d.leftPct}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` }}
          >
            💸
          </div>
        ))}
      </div>
      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="bg-white pixel-border shadow-pixel p-12">
          <div className="text-6xl mb-6">🔥</div>
          <h1 className="font-pixel text-3xl md:text-4xl mb-6">RECEIVED.</h1>
          <a href="/#board">
            <PixelButton className="text-base px-8 py-4">VIEW LEADERBOARD</PixelButton>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
