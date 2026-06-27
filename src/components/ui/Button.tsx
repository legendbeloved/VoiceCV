import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'destructive' | 'loading' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: string;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  tooltip,
  children,
  ...props
}, ref) => {
  const variants = {
    primary: "bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_16px_40px_rgba(46,92,255,0.22)] hover:shadow-[0_20px_54px_rgba(46,92,255,0.32)]",
    secondary: "bg-[var(--panel)] border border-[var(--border)] text-[var(--text)]",
    ghost: "bg-transparent border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]",
    icon: "bg-[var(--panel)] border border-[var(--border)] p-0 justify-center items-center rounded-2xl text-[var(--text)]",
    destructive: "bg-destructive text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    outline: "bg-transparent border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]",
    loading: "opacity-80 pointer-events-none"
  };

  const sizes = {
    sm: "px-4 py-2.5 min-h-[44px] text-xs",
    md: "px-6 py-3 min-h-[48px] text-sm",
    lg: "px-8 py-4 min-h-[52px] text-base"
  };

  const baseClasses = "relative inline-flex items-center justify-center font-display font-bold uppercase tracking-widest rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-3 focus:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseClasses,
        variants[variant === 'loading' ? 'loading' : variant],
        variant !== 'icon' && sizes[size],
        variant === 'icon' && "w-12 h-12",
        className
      )}
      disabled={disabled || loading}
      title={tooltip}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 className="animate-spin" size={variant === 'icon' ? 24 : 18} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            {leftIcon}
            {children}
            {rightIcon}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

Button.displayName = 'Button';

export { Button };
