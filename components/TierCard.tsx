import { getTierForAmount, Tier } from '@/lib/tiers';

type Props = { amount: number };

export default function TierCard({ amount }: Props) {
  const tier: Tier | null = getTierForAmount(amount);
  if (!tier) return null;

  const rangeLabel = tier.max
    ? `$${tier.min.toLocaleString()} - $${tier.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${tier.min.toLocaleString()}+`;

  return (
    <div className={`relative pixel rounded bg-white border border-black shadow-[4px_4px_0_0_var(--ink)] ${tier.bgClass}`}>
      <div className="p-4">
        <div className={`text-xl font-bold text-black`}>{tier.name}</div>
        <div className="text-sm mt-1 text-black">{rangeLabel}</div>
      </div>
    </div>
  );
}
