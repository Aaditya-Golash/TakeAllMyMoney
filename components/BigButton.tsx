import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function BigButton({ children, className, loading, disabled, ...rest }: BigButtonProps) {
  return (
    <button
      className={clsx(
        'relative w-full rounded-none border-2 border-black bg-cherry px-6 py-4 text-lg font-bold uppercase tracking-widest text-black shadow-pixel transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      <span className="block text-center font-mono">
        {loading ? 'Processing…' : children}
      </span>
    </button>
  );
}
