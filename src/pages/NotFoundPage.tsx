import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';

export function NotFoundPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-[var(--accent)] rounded-full blur-[100px] opacity-20" />
        <h1 className="text-[140px] sm:text-[180px] font-display font-black leading-none text-[var(--accent)] opacity-90">
          404
        </h1>
      </motion.div>
      
      <h2 className="text-3xl font-display font-bold mb-6 text-[var(--text)]">This page is outside the MVP.</h2>
      <p className="text-[var(--muted)] text-lg mb-12 max-w-md mx-auto">
        The path you took isn't part of your professional narrative yet. Let's get you back on track.
      </p>

      <Button size="lg" onClick={onBack}>
        <ChevronLeft size={20} className="mr-2" />
        Back to Home
      </Button>

      <div className="mt-20 flex items-center gap-2 opacity-20">
        {[...Array(28)].map((_, i) => (
          <div key={i} className="w-1.5 bg-[var(--accent)] rounded-full" style={{ height: ((i * 17) % 48) + 16 }} />
        ))}
      </div>
    </div>
  );
}
