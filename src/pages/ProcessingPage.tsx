import React from 'react';
import { Brain, Check, FileText, Linkedin, Loader2, Mail, Mic2 } from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type StepStatus = 'waiting' | 'working' | 'done' | 'skipped';

const statusLabel: Record<StepStatus, string> = {
  waiting: 'Waiting',
  working: 'Working',
  done: 'Done',
  skipped: 'Skipped',
};

export function ProcessingPage({
  onCancel,
  onRetry,
  onEditTranscript,
}: {
  onCancel: () => void;
  onRetry: () => void;
  onEditTranscript: () => void;
}) {
  const { processingStep, processingError, hadAudio } = useVoiceCVStore();
  const failed = processingStep === 'error';
  const finished = processingStep === 'complete';

  const transcribeStatus: StepStatus = !hadAudio
    ? 'skipped'
    : finished
      ? 'done'
      : failed
        ? 'waiting'
        : 'working';

  const writeStatus: StepStatus = finished
    ? 'done'
    : failed
      ? 'waiting'
      : processingStep === 'writing'
        ? 'working'
        : 'waiting';

  const documentStatus: StepStatus = finished ? 'done' : 'waiting';

  const steps: Array<{ key: string; label: string; icon: typeof Mic2; status: StepStatus }> = [
    { key: 'transcribe', label: 'Transcribe your story', icon: Mic2, status: transcribeStatus },
    { key: 'write', label: 'Write the resume, cover letter, and LinkedIn bio', icon: Brain, status: writeStatus },
    { key: 'resume', label: 'Resume', icon: FileText, status: documentStatus },
    { key: 'letter', label: 'Cover letter', icon: Mail, status: documentStatus },
    { key: 'linkedin', label: 'LinkedIn bio', icon: Linkedin, status: documentStatus },
  ];

  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-2xl flex-col items-center justify-center">
      <Card padding="lg" className="w-full">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8 h-28 w-28">
            <div className="absolute inset-4 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)]">
              <Brain size={42} className="text-[var(--accent)]" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">
            {failed ? 'Needs another try' : finished ? 'Documents ready' : 'VoiceCV is working'}
          </p>
          <h1 className="mt-3 text-3xl font-display font-extrabold text-[var(--text)]">
            {failed ? 'The documents were not finished' : 'Turning your story into documents'}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            {hadAudio
              ? 'Transcription and writing happen in one request. The transcript step stays on Working until the documents come back.'
              : 'You already provided text, so transcription is skipped and VoiceCV goes straight to writing.'}
          </p>
        </div>

        <div className="mt-8 space-y-3" aria-live="polite">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4 ${step.status === 'waiting' ? 'opacity-70' : 'opacity-100'}`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${step.status === 'done' ? 'bg-emerald-500/15 text-emerald-600' : step.status === 'working' ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                {step.status === 'done' ? <Check size={20} /> : step.status === 'working' ? <Loader2 size={20} className="animate-spin" /> : <step.icon size={20} />}
              </div>
              <span className="flex-1 font-display text-base font-bold text-[var(--text)]">{step.label}</span>
              <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">{statusLabel[step.status]}</span>
            </div>
          ))}
        </div>

        {failed && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm leading-6 text-[var(--text)]" role="alert">
            {processingError}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {failed ? (
            <>
              <Button className="flex-1" onClick={onRetry}>Try again</Button>
              <Button className="flex-1" variant="secondary" onClick={onEditTranscript}>Edit transcript</Button>
            </>
          ) : (
            <Button className="w-full" variant="ghost" onClick={onCancel}>Cancel and keep the transcript</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
