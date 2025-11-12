import React from 'react';

type StyledInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export default function StyledInput({ className = '', error, ...props }: StyledInputProps) {
  return (
    <div className="w-full">
      <input
        {...props}
        className={
          `input pixel bg-white shadow-[4px_4px_0_0_var(--ink)] focus:outline-none ` +
          (className || '')
        }
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>
      ) : null}
    </div>
  );
}

