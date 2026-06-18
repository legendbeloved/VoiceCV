import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface GlassPanelProps {
  className?: string;
  children: React.ReactNode;
  glowColor?: 'violet' | 'amber';
}

export function GlassPanel({ className, children, glowColor }: GlassPanelProps) {
  return (
    <div className={cn(
      "relative w-full glass-liquid rounded-[3rem] p-8 overflow-hidden",
      glowColor === 'violet' && "shadow-[0_0_40px_rgba(124,58,237,0.15)]",
      glowColor === 'amber' && "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
      className
    )}>
      {/* Internal highlight at top */}
      <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Content wrapper with motion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
