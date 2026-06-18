import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          "max-w-[1280px] mx-auto min-h-screen pt-28 pb-20 px-5 sm:px-8 md:px-10 w-full",
          className
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
