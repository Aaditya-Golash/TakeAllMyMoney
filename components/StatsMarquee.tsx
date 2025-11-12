'use client';
import { useEffect, useState } from 'react';

export default function StatsMarquee() {
  const [text, setText] = useState('Loading stats…');
  useEffect(() => {
    fetch('/api/leaderboard?period=all')
      .then(r => r.json())
      .then(d => {
        const total = (d.top || []).reduce((s: number, r: any) => s + (r.amountCents || 0), 0);
        const players = new Set((d.top || []).map((r: any) => r.handle || 'Anonymous')).size;
        setText(`$${(total / 100).toLocaleString()} thrown all-time • ${players} burners • Be the next legend`);
      })
      .catch(() => setText('Be the first to throw!'));
  }, []);
  return (
    <div className="overflow-hidden pixel bg-white/80 py-2 px-3 mt-2" aria-live="polite">
      <div className="whitespace-nowrap animate-[marquee_18s_linear_infinite]">
        {text} • {text} • {text}
      </div>
      <style jsx>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

