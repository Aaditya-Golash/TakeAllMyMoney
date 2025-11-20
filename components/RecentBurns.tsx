'use client';
import { useEffect, useState } from 'react';

type RecentEntry = {
  handle: string | null;
  amountCents: number;
  message: string | null;
};

export default function RecentBurns() {
  const [line, setLine] = useState('Waiting for the next burn...');

  useEffect(() => {
    fetch('/api/recent')
      .then((res) => res.json())
      .then((data) => {
        const items = (data.recent || []).slice(0, 5) as RecentEntry[];
        if (!items.length) {
          setLine('Be the first legend to burn some cash.');
          return;
        }
        const formatted = items.map((entry) => {
          const handle = (entry.handle || 'anon').trim();
          const amount = (entry.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
          const msg = (entry.message || '').trim();
          return msg ? `${handle} threw $${amount}: ${msg}` : `${handle} threw $${amount}`;
        });
        const joined = formatted.join(' | ');
        setLine(`${joined} | ${joined}`);
      })
      .catch(() => setLine('Be the first legend to burn some cash.'));
  }, []);

  return (
    <div className="overflow-hidden pixel bg-white/70 py-2 px-3 mt-4" aria-live="polite">
      <div className="whitespace-nowrap animate-[recentMarquee_20s_linear_infinite] text-sm text-black/80">
        {line}
      </div>
      <style jsx>{`
        @keyframes recentMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
