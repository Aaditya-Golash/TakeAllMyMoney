'use client';
import { FormEvent, useState } from 'react';
import AmountChips from '@/components/AmountChips';
import StyledInput from '@/components/StyledInput';
import PixelButton from '@/components/PixelButton';
import TierCard from '@/components/TierCard';

const HANDLE_REGEX = /^[a-zA-Z0-9_]{2,20}$/;

export default function ThrowPanel() {
  const [amount, setAmount] = useState(5);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [handleError, setHandleError] = useState('');
  const [showNuke, setShowNuke] = useState(false);
  const [showMoneyBurst, setShowMoneyBurst] = useState(false);

  const validateHandle = (value: string) => {
    if (!value) {
      setHandleError('');
      return true;
    }
    if (!HANDLE_REGEX.test(value)) {
      setHandleError('2-20 chars, letters/numbers/_');
      return false;
    }
    setHandleError('');
    return true;
  };

  async function throwMoney() {
    if (amount < 2) {
      alert('Custom amount must be at least $2');
      return;
    }

    const trimmed = (handle || '').trim();
    if (trimmed && !validateHandle(trimmed)) return;
    const finalHandle = trimmed || 'anon';
    const finalMessage = message.trim();

    setShowMoneyBurst(true);
    setTimeout(() => setShowMoneyBurst(false), 1500);
    setBusy(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, handle: finalHandle, message: finalMessage })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to create checkout session');
      }
      window.location.href = data.url as string;
    } catch (err: any) {
      alert(err?.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void throwMoney();
  };

  return (
    <section className="mt-6 relative">
      {showNuke && <div className="nuke-screen" />}
      {(showMoneyBurst || busy) && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-40">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-burn-cash"
              style={{ left: `${(i * 100) / 18}%`, animationDelay: `${i * 0.12}s` }}
            >
              💸
            </div>
          ))}
        </div>
      )}

      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold">Amount</label>
          <AmountChips selected={amount} onSelect={(value) => setAmount(value)} />
          <div className="flex items-center gap-2">
            <StyledInput
              type="number"
              min={2}
              step={1}
              value={amount}
              placeholder="Custom amount"
              autoFocus
              onChange={(e) => {
                const v = parseInt((e.target as any).value || '2', 10);
                setAmount(Number.isFinite(v) ? Math.max(2, v) : 2);
                if (Number.isFinite(v) && v >= 100000) {
                  setShowNuke(true);
                  setTimeout(() => setShowNuke(false), 1600);
                }
              }}
              className="w-44"
              aria-label="Custom amount"
            />
            <span className="text-sm text-black/70">USD</span>
          </div>
        </div>

        <TierCard amount={amount} />

        <StyledInput
          placeholder="Handle (optional)"
          value={handle}
          onChange={(e) => {
            const value = (e.target as any).value;
            setHandle(value);
            validateHandle(value.trim());
          }}
          error={handleError}
        />
        <StyledInput
          placeholder="Message (optional, max 120 chars)"
          value={message}
          onChange={(e) => setMessage((e.target as any).value)}
          maxLength={120}
        />

        <div className="grid gap-2">
          <PixelButton type="submit" disabled={busy}>
            {busy ? 'Opening checkout...' : `THROW $${amount.toLocaleString()}`}
          </PixelButton>
          <div className="flex items-center justify-center gap-2 text-xs text-black/70">
            <span className="inline-block">💳</span>
            <span>Payments processed by Stripe</span>
          </div>
        </div>
      </form>
    </section>
  );
}
