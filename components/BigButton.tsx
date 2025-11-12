type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

export default function BigButton({ children, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={
        'px-6 py-4 rounded-lg bg-[var(--accent)] text-ink pixel ' +
        'active:translate-x-[2px] active:translate-y-[2px] ' + className
      }
    >
      {children}
    </button>
  );
}

// Also export a named version for modules that import { BigButton }
export { BigButton };
