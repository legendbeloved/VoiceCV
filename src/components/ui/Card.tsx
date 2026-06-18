import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export type CardVariant = 'glass' | 'solid' | 'accent';

interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({
  variant = 'glass',
  padding = 'md',
  hover = false,
  className,
  children,
  onClick,
}: CardProps) {
  const variants = {
    glass: "bg-[var(--panel)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-xl",
    solid: "bg-[var(--surface)] border border-[var(--border)]",
    accent: "bg-[var(--accent-soft)] border border-[var(--border)] backdrop-blur-xl"
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-12"
  };

  return (
    <motion.div
      whileHover={hover || onClick ? { scale: 1.01, y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } : undefined}
      className={cn(
        "rounded-3xl overflow-hidden transition-all duration-300",
        variants[variant],
        paddings[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
