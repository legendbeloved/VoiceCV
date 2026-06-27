import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'full';
}

export function PageWrapper({ children, className, variant = 'default' }: PageWrapperProps) {
  const variants = {
    default: "max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12",
    narrow: "max-w-[800px] mx-auto px-4 sm:px-6 md:px-8",
    full: "w-full px-4 sm:px-6 md:px-8 lg:px-10"
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          "min-h-screen pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20 w-full",
          variants[variant],
          className
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
