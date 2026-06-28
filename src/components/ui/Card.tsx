import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export type CardVariant = 'glass' | 'solid' | 'accent' | 'outline' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantClasses: Record<CardVariant, string> = {
  glass: "bg-[var(--panel)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-xl",
  solid: "bg-[var(--surface)] border border-[var(--border)]",
  accent: "bg-[var(--accent-soft)] border border-[var(--border)] backdrop-blur-xl",
  outline: "bg-transparent border-2 border-[var(--border)]",
  elevated: "bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5 lg:p-6",
  lg: "p-5 sm:p-6 lg:p-8",
  xl: "p-6 sm:p-8 lg:p-12",
};

const hoverAnimation = {
  scale: 1.01,
  y: -4,
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

const tapAnimation = { scale: 0.98, transition: { duration: 0.1 } };

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', padding = 'md', hover = false, interactive = false, className, children, onClick, ...props }, ref) => {
    const shouldAnimate = hover || interactive || !!onClick;

    return (
      <motion.div
        ref={ref}
        whileHover={shouldAnimate ? hoverAnimation : undefined}
        whileTap={onClick ? tapAnimation : undefined}
        className={cn(
          "rounded-3xl overflow-hidden transition-all duration-300",
          variantClasses[variant],
          paddingClasses[padding],
          (interactive || onClick) && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// ─── Specialized Card Components ──────────────────────────────────────────────

export function GlassCard({ children, className, padding = 'md', ...props }: Omit<CardProps, 'variant'>) {
  return <Card variant="glass" padding={padding} className={className} {...props}>{children}</Card>;
}

export function SolidCard({ children, className, padding = 'md', ...props }: Omit<CardProps, 'variant'>) {
  return <Card variant="solid" padding={padding} className={className} {...props}>{children}</Card>;
}

export function AccentCard({ children, className, padding = 'md', ...props }: Omit<CardProps, 'variant'>) {
  return <Card variant="accent" padding={padding} className={className} {...props}>{children}</Card>;
}

export function ElevatedCard({ children, className, padding = 'md', ...props }: Omit<CardProps, 'variant'>) {
  return <Card variant="elevated" padding={padding} className={className} {...props}>{children}</Card>;
}

export function OutlineCard({ children, className, padding = 'md', ...props }: Omit<CardProps, 'variant'>) {
  return <Card variant="outline" padding={padding} className={className} {...props}>{children}</Card>;
}

// ─── Interactive Card with Press Animation ────────────────────────────────────
// Pre-configured for click handlers

export function InteractiveCard({
  children,
  onClick,
  className,
  padding = 'md',
  variant = 'glass',
  ...props
}: CardProps & { onClick: () => void }) {
  return (
    <Card
      variant={variant}
      padding={padding}
      interactive
      onClick={onClick}
      className={cn('cursor-pointer', className)}
      {...props}
    >
      {children}
    </Card>
  );
}