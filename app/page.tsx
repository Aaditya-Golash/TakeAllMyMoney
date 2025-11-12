'use client';

import { useMemo, useState } from 'react';
import { BigButton } from '@/components/BigButton';

const presetAmounts = [1, 5, 10, 50];
const handlePattern = /^[a-zA-Z0-9_]{2,20}$/;

export default function HomePage() {
  const [amount, setAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  const isCustomSelected = useMemo(() => !presetAmounts.includes(amount), [amount]);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          handle: handle.trim() ? handle.trim() : undefined,
          message: message.trim() ? message.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ? JSON.stringify(data.error) : 'Something broke. Try again.');
        return;
      }

      const data = await response.json();
      if (data?.url) window.location.href = data.url as string;
    } catch (err) {
      console.error(err);
      setError('Could not reach the money furnace.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAmountBlur = () => {
    const parsed = Number(customAmount);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      setAmount(Math.floor(parsed));
    }
  };

  const disableButton = amount < 1 || (handle.trim() && !handlePattern.test(handle.trim()));

  return (
    <main className="flex flex-1 flex-col gap-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-black/60">Welcome to</p>
        <h1 className="text-5xl font-extrabold uppercase leading-tight">Take All My Money</h1>
        <p className="max-w-xl text-lg text-black/70">
          Throw your money. No prizes. No refunds. Climb the leaderboard and bask in absolutely zero rewards.
        </p>
      </header>

      <section className="space-y-6 rounded-md border-2 border-black bg-white p-6 shadow-pixel">
        <h2 className="text-xl font-bold uppercase tracking-widest">Pick your burn</h2>
        <div className="flex flex-wrap gap-3">
          {presetAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setAmount(value);
                setCustomAmount('');
              }}
              className={`rounded-md border-2 border-black px-4 py-2 font-mono text-lg transition-colors ${
                amount === value ? 'bg-royal text-white' : 'bg-parchment hover:bg-mint'
              }`}
            >
              {`$${value}`}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm uppercase">or</span>
            <input
              type="number"
              min={1}
              value={isCustomSelected ? customAmount : ''}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setAmount(Number(event.target.value) || amount);
              }}
              onBlur={handleCustomAmountBlur}
              placeholder="Custom"
              className="w-24 rounded-md border-2 border-black bg-parchment px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-royal"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-wide text-black/70">
            Handle (optional)
            <input
              type="text"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="2-20 letters, numbers, _"
              className="rounded-md border-2 border-black bg-parchment px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-royal"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-wide text-black/70">
            Message (optional)
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell the world why you're torching cash"
              className="min-h-[120px] rounded-md border-2 border-black bg-parchment px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-royal"
              maxLength={200}
            />
          </label>
        </div>

        {handle.trim() && !handlePattern.test(handle.trim()) && (
          <p className="text-sm font-mono text-cherry">
            Handle must be 2-20 letters, numbers, or underscores.
          </p>
        )}
        {error && <p className="text-sm font-mono text-cherry">{error}</p>}

        <BigButton onClick={submit} loading={loading} disabled={disableButton}>
          {`Throw $${amount}`}
        </BigButton>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 text-sm text-black/70">
        <p>100% pointless. 100% intentional.</p>
        <a href="/leaderboard" className="underline decoration-dotted underline-offset-4">
          View the leaderboard →
        </a>
      </footer>
    </main>
  );
}
