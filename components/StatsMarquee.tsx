'use client';
import { useEffect, useState } from 'react';

const EMPTY_MESSAGE = 'Share a message to appear here';

export default function StatsMarquee() {
  const [statsLine, setStatsLine] = useState('Loading stats...');
  const [messageLine, setMessageLine] = useState(EMPTY_MESSAGE);

  useEffect(() => {
    fetch('/api/leaderboard?period=all')
      .then((r) => r.json())
      .then((d) => {
        const total = (d.top || []).reduce((sum: number, row: any) => sum + (row.amountCents || 0), 0);
        const players = new Set((d.top || []).map((row: any) => row.handle || 'Anonymous')).size;
        setStatsLine(`$${(total / 100).toLocaleString()} thrown all-time - ${players} burners - Be the next legend`);
      })
      .catch(() => setStatsLine('Be the first to throw!'));

    fetch('/api/recent')
      .then((r) => r.json())
      .then((d) => {
        const msgs = (d.recent || [])
          .map((entry: any) => (entry.message || '').toString().trim())
          .filter(Boolean);
        if (msgs.length) {
          const joined = msgs.join(' | ');
          setMessageLine(`${joined} | ${joined}`);
        } else {
          setMessageLine(EMPTY_MESSAGE);
        }
      })
      .catch(() => setMessageLine(EMPTY_MESSAGE));
  }, []);

  return (
    <div className="mt-2 flex flex-col gap-2" aria-live="polite">
      <div className="overflow-hidden pixel bg-white/80 py-2 px-3">
        <div className="whitespace-nowrap animate-[marquee_18s_linear_infinite]">
          {statsLine} - {statsLine}
        </div>
      </div>
      <div className="overflow-hidden pixel bg-white/70 py-2 px-3 text-sm text-black/80">
        <div className="whitespace-nowrap animate-[messageMarquee_22s_linear_infinite]">
          {messageLine}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes messageMarquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
      `}</style>
    </div>
  );
}
