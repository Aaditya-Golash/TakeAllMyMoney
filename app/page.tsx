'use client';
import StatsMarquee from '@/components/StatsMarquee';
import ThrowPanel from '@/components/ThrowPanel';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  return (
    <>
      <StatsMarquee />
      <ThrowPanel />
      <a href="#board" className="underline mt-4 inline-block">View leaderboard ?</a>
      <Leaderboard />
    </>
  );
}
