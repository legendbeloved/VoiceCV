import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'recording' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  className,
  children,
}: BadgeProps) {
  const variants = {
    default: "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    recording: "bg-[var(--warm)] text-[var(--bg)] font-black animate-pulse-glow",
    outline: "bg-transparent border border-[var(--border)] text-[var(--muted)]"
  };

  return (
    <div className={cn(
      "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest leading-none",
      variants[variant],
      className
    )}>
      {variant === 'recording' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg)] mr-2 animate-pulse" />}
      {children}
    </div>
  );
}
