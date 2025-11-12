type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

// Pixel-styled button matching pocket-splash look
export default function PixelButton({ children, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={
        [
          'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase',
          'pixel-border shadow-pixel active:shadow-pixel-pressed active:translate-x-[2px] active:translate-y-[2px]',
          'bg-[var(--accent)] text-white px-6 py-4',
          className,
        ].join(' ')
      }
    >
      {children}
    </button>
  );
}

