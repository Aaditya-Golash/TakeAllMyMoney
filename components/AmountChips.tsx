import { TIER_STARTING_AMOUNTS } from '@/lib/tiers';

type Props = {
  selected: number;
  onSelect: (amount: number) => void;
  amounts?: number[];
};

// Pixel-styled selectable chips for preset amounts
export default function AmountChips({ selected, onSelect, amounts = TIER_STARTING_AMOUNTS }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {amounts.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onSelect(amount)}
          className={`px-4 py-2 text-sm pixel rounded shadow-[4px_4px_0_0_var(--ink)] border border-black ${
            selected === amount ? 'bg-[var(--accent)] text-white' : 'bg-white text-ink'
          }`}
          aria-pressed={selected === amount}
        >
          ${amount.toLocaleString()}
        </button>
      ))}
    </div>
  );
}
