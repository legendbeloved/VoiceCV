import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  helperText,
  error,
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId();

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-2">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-6 py-4 bg-[var(--panel)] border border-[var(--border)] rounded-2xl text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-all",
            "focus:bg-[var(--surface)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]",
            error && "border-destructive/50 focus:border-destructive focus:ring-destructive/5",
            className
          )}
          {...props}
        />
        <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 opacity-0 group-focus-within:opacity-100 shadow-[0_0_20px_rgba(46,92,255,0.12)]" />
      </div>

      {error ? (
        <p className="text-destructive text-xs font-medium ml-2">{error}</p>
      ) : helperText ? (
        <p className="text-[var(--muted)] text-xs font-medium ml-2">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
