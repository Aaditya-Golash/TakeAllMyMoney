'use client';
import StatsMarquee from '@/components/StatsMarquee';
import ThrowPanel from '@/components/ThrowPanel';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  return (
    <>
      <header className="text-center mt-6 space-y-3">
        <h1 className="text-4xl font-bold font-pixel">Take All My Money</h1>
        <p className="text-sm text-black/70">
          Throw money into the void. Get your name on the Wall. No prizes. No refunds.
        </p>
      </header>
      <StatsMarquee />
      <ThrowPanel />
      <a href="#board" className="underline mt-4 inline-block">View leaderboard ?</a>
      <Leaderboard />
    </>
  );
}
