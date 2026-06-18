import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Brain, Check, FileText, Linkedin, Loader2, Mail, Mic2 } from 'lucide-react';
import { useVoiceCVStore, ProcessingStep } from '../store/useVoiceCVStore';
import { Card } from '../components/ui/Card';

export function ProcessingPage() {
  const { processingStep } = useVoiceCVStore();
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    'Transcribing the audio...',
    'Extracting skills, achievements, education, and experience...',
    'Writing ATS-friendly resume bullets...',
    'Keeping the LinkedIn bio short and human...',
    'Almost ready.',
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, []);

  const steps = [
    { key: 'transcribing', label: 'Audio transcription', icon: Mic2 },
    { key: 'understanding', label: 'Career extraction', icon: Brain },
    { key: 'resume', label: 'Resume generation', icon: FileText },
    { key: 'coverLetter', label: 'Cover letter draft', icon: Mail },
    { key: 'linkedin', label: 'LinkedIn bio polish', icon: Linkedin },
  ];

  const getStatus = (stepKey: string) => {
    const order: ProcessingStep[] = ['idle', 'transcribing', 'understanding', 'resume', 'coverLetter', 'linkedin', 'complete'];
    const currentIdx = order.indexOf(processingStep);
    const stepIdx = order.indexOf(stepKey as ProcessingStep);

    if (processingStep === 'complete' || currentIdx > stepIdx) return 'complete';
    if (processingStep === stepKey) return 'active';
    return 'pending';
  };

  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-2xl flex-col items-center justify-center">
      <Card padding="lg" className="w-full">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-10 h-32 w-32">
            <motion.div
              animate={{ scale: [1, 1.16, 1], opacity: [0.25, 0.48, 0.25] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-[var(--accent)] blur-2xl"
            />
            <div className="absolute inset-4 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)]">
              <Brain size={42} className="text-[var(--accent)]" />
            </div>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">Gemini is working</p>
          <h1 className="mt-3 text-3xl font-display font-extrabold text-[var(--text)]">Turning voice into career documents</h1>
        </div>

        <div className="mt-10 space-y-4">
          {steps.map((step) => {
            const status = getStatus(step.key);
            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4 transition-opacity ${status === 'pending' ? 'opacity-45' : 'opacity-100'}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${status === 'complete' ? 'bg-emerald-500/15 text-emerald-500' : status === 'active' ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                  {status === 'complete' ? <Check size={20} /> : status === 'active' ? <Loader2 size={20} className="animate-spin" /> : <step.icon size={20} />}
                </div>
                <span className="font-display text-base font-bold text-[var(--text)]">{step.label}</span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 text-center text-sm font-medium text-[var(--muted)]"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </Card>
    </div>
  );
}
