import React from 'react';
import { Mic2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 w-full py-10 px-6 sm:px-8 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3 text-[var(--muted)]">
            <Mic2 size={22} />
            <span className="font-display font-extrabold text-xl">VoiceCV</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">
            Speak Once. Land the Job.
          </p>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
          Voice-first career documents.
        </div>
      </div>
    </footer>
  );
}
