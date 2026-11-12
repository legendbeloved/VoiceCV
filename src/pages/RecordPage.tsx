import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Keyboard, Mic2, Pause, Pin, Play, RotateCcw, Square } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { readVoiceDraft, useVoiceCVStore, writeVoiceDraft } from '../store/useVoiceCVStore';
import { usePlanStore } from '../store/usePlanStore';
import { useNavigate } from 'react-router-dom';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { WaveformVisualizer } from '../components/recording/WaveformVisualizer';
import { AudioPlayback } from '../components/recording/AudioPlayback';
import type { ResumeTemplate, ToneStyle } from '../lib/gemini';

interface RecordPageProps {
  onSubmit: (payload: {
    audioBlob: Blob | null;
    transcriptHint: string;
    jobDescription: string;
    tone: ToneStyle;
    resumeTemplate: ResumeTemplate;
  }) => void;
}

const tones: Array<{ id: ToneStyle; label: string; description: string }> = [
  { id: 'professional', label: 'Professional', description: 'Clear and recruiter-friendly.' },
  { id: 'warm', label: 'Warm', description: 'Approachable and human.' },
  { id: 'executive', label: 'Executive', description: 'Concise and strategic.' },
  { id: 'confident', label: 'Confident', description: 'Energetic and achievement-led.' },
  { id: 'creative', label: 'Creative', description: 'Memorable, still polished.' },
];

const templates: Array<{ id: ResumeTemplate; label: string; description: string }> = [
  { id: 'ats', label: 'Classic ATS', description: 'Clean headings and recruiter-friendly bullets.' },
  { id: 'modern', label: 'Modern', description: 'Tight summary with skills near the top.' },
  { id: 'executive', label: 'Executive', description: 'Leadership profile and business impact first.' },
  { id: 'creative', label: 'Creative', description: 'More personality while staying readable.' },
];

const talkingPrompts = [
  'What is your current or most recent role?',
  'Name a result you are proud of.',
  'Which tools or skills do you use most?',
  'What kind of role do you want next?',
];

export function RecordPage({ onSubmit }: RecordPageProps) {
  const navigate = useNavigate();
  const plan = usePlanStore((state) => state.plan);
  const {
    jobRole,
    jobDescription,
    tone,
    resumeTemplate,
    setJobRole,
    setJobDescription,
    setTone,
    setResumeTemplate,
    audioBlob,
    setAudioBlob,
    setTranscript,
    draftSavedAt,
    setDraftSavedAt,
  } = useVoiceCVStore();
  const [inputMode, setInputMode] = useState<'voice' | 'manual'>('voice');
  const [transcription, setTranscription] = useState('');
  const [reviewedTranscript, setReviewedTranscript] = useState('');
  const [localJobRole, setLocalJobRole] = useState(jobRole);
  const [localJobDescription, setLocalJobDescription] = useState(jobDescription);
  const [localTone, setLocalTone] = useState<ToneStyle>(tone);
  const [localTemplate, setLocalTemplate] = useState<ResumeTemplate>(resumeTemplate);
  const [showJobDescription, setShowJobDescription] = useState(Boolean(jobDescription));
  const [showConfirm, setShowConfirm] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [pinnedPrompt, setPinnedPrompt] = useState(talkingPrompts[0]);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const baseTranscriptRef = useRef('');
  const recordButtonRef = useRef<HTMLButtonElement>(null);

  const {
    startRecording: startAudio,
    stopRecording: stopAudio,
    pauseRecording: pauseAudio,
    resumeRecording: resumeAudio,
    resetRecording: resetAudio,
    audioState,
    formattedTime,
    getFrequencyData,
    error: audioError,
  } = useAudioRecorder();

  const isRecording = audioState === 'recording';
  const isPaused = audioState === 'paused';
  const isComplete = audioState === 'complete';
  const wordCount = reviewedTranscript.trim() ? reviewedTranscript.trim().split(/\s+/).length : 0;
  const canGenerate = wordCount > 2 || (inputMode === 'voice' && !!audioBlob);
  const shortStory = inputMode === 'manual' ? wordCount > 0 && wordCount < 20 : isComplete && wordCount > 0 && wordCount < 20;
  const phase: 'setup' | 'speak' | 'review' = inputMode === 'manual' || isComplete ? 'review' : isRecording || isPaused ? 'speak' : 'setup';

  useEffect(() => {
    const draft = readVoiceDraft();
    if (!draft) return;
    if (!jobRole && draft.jobRole) setLocalJobRole(draft.jobRole);
    if (!jobDescription && draft.jobDescription) {
      setLocalJobDescription(draft.jobDescription);
      setShowJobDescription(true);
    }
    if (!reviewedTranscript && draft.transcript) {
      setReviewedTranscript(draft.transcript);
      setTranscription(draft.transcript);
      finalTranscriptRef.current = `${draft.transcript} `;
    }
    setDraftSavedAt(draft.savedAt);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setJobRole(localJobRole);
      setJobDescription(localJobDescription);
      setTone(localTone);
      setResumeTemplate(localTemplate);
      const savedAt = writeVoiceDraft({
        jobRole: localJobRole,
        jobDescription: localJobDescription,
        tone: localTone,
        resumeTemplate: localTemplate,
        transcript: reviewedTranscript,
      });
      setDraftSavedAt(savedAt);
    }, 400);
    return () => clearTimeout(timer);
  }, [localJobRole, localJobDescription, localTone, localTemplate, reviewedTranscript, setJobRole, setJobDescription, setTone, setResumeTemplate, setDraftSavedAt]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechNotice('Live transcript is not supported in this browser. VoiceCV will still process your recorded audio after you submit.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalTranscriptRef.current += `${text} `;
        } else {
          interimTranscript += text;
        }
      }
      const spoken = `${finalTranscriptRef.current}${interimTranscript}`.trim();
      const nextTranscript = [baseTranscriptRef.current, spoken].filter(Boolean).join('\n\n');
      setTranscription(nextTranscript);
      setReviewedTranscript(nextTranscript);
    };
    recognition.onerror = () => {
      setSpeechNotice('Live transcript paused. Your audio recording is still saved for VoiceCV processing.');
    };
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName)) return;
      if (inputMode !== 'voice' || isComplete) return;
      event.preventDefault();
      if (isRecording || isPaused) handleStop();
      else startNewRecording();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const startNewRecording = (append = false) => {
    if (append) {
      baseTranscriptRef.current = reviewedTranscript.trim();
    } else {
      baseTranscriptRef.current = '';
      setTranscription('');
      setReviewedTranscript('');
      setTranscript('');
    }
    finalTranscriptRef.current = '';
    startAudio();
    try {
      recognitionRef.current?.start();
    } catch {
      setSpeechNotice('Live transcript could not start, but audio recording can continue.');
    }
  };

  const handleStart = () => {
    if (audioBlob || transcription.trim()) {
      setShowConfirm(true);
      return;
    }
    startNewRecording();
  };

  const handleStop = () => {
    stopAudio();
    recognitionRef.current?.stop();
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeAudio();
      try {
        recognitionRef.current?.start();
      } catch {
        setSpeechNotice('Live transcript stayed paused. The audio recording continues.');
      }
      return;
    }
    pauseAudio();
    recognitionRef.current?.stop();
  };

  const handleDiscard = () => {
    resetAudio();
    finalTranscriptRef.current = '';
    setTranscription('');
    setReviewedTranscript('');
    setTranscript('');
    setShowConfirm(false);
  };

  const handleSkipSetup = () => {
    setLocalJobRole('');
    setLocalJobDescription('');
    setShowJobDescription(false);
  };

  const handleGenerate = () => {
    const cleanedTranscript = reviewedTranscript.trim();
    setJobRole(localJobRole);
    setJobDescription(localJobDescription);
    setTone(localTone);
    setResumeTemplate(localTemplate);
    setTranscript(cleanedTranscript);
    if (inputMode === 'manual') setAudioBlob(null);
    onSubmit({
      audioBlob: inputMode === 'voice' ? audioBlob : null,
      transcriptHint: cleanedTranscript,
      jobDescription: localJobDescription,
      tone: localTone,
      resumeTemplate: localTemplate,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--text)] sm:text-4xl">Tell your story</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
            Set a role if you have one, speak for up to {plan === 'premium' ? '3 minutes' : '60 seconds'}, then correct the transcript before VoiceCV writes.
          </p>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]" role="status">
          {draftSavedAt ? `Draft saved ${new Date(draftSavedAt).toLocaleTimeString()}` : 'Draft will save as you type'}
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-3" aria-label="Recording steps">
        {[
          { id: 'setup' as const, label: 'Setup' },
          { id: 'speak' as const, label: inputMode === 'manual' ? 'Write' : 'Speak' },
          { id: 'review' as const, label: 'Review' },
        ].map((step, index) => {
          const active = phase === step.id;
          return (
            <li key={step.id} className={`rounded-2xl border px-4 py-3 text-sm font-bold ${active ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
              {index + 1}. {step.label}
            </li>
          );
        })}
      </ol>

      <Card variant="solid" padding="lg" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-bold text-[var(--text)]">Before the microphone</h2>
          <Button variant="ghost" size="sm" onClick={handleSkipSetup}>Skip role and job description</Button>
        </div>
        <Input
          label="Target role"
          placeholder="Frontend developer, customer success, product lead"
          value={localJobRole}
          onChange={(event) => setLocalJobRole(event.target.value)}
          helperText="Optional. VoiceCV can infer a title from the story."
        />
        {showJobDescription ? (
          <div className="space-y-2">
            <label htmlFor="job-description" className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Job description</label>
            <textarea
              id="job-description"
              value={localJobDescription}
              onChange={(event) => setLocalJobDescription(event.target.value)}
              placeholder="Paste a job post so the documents can mirror its keywords."
              className="min-h-28 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-5 py-4 text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
            />
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShowJobDescription(true)}>Add a job description</Button>
        )}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Tone</p>
          <div className="flex flex-wrap gap-2" role="listbox" aria-label="Tone">
            {tones.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={localTone === item.id}
                onClick={() => setLocalTone(item.id)}
                className={`rounded-full border px-4 py-2 text-left text-xs font-bold ${localTone === item.id ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
              >
                {item.label}
                <span className="mt-1 block font-medium normal-case tracking-normal text-[var(--muted)]">{item.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Resume template</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={localTemplate === item.id}
                onClick={() => setLocalTemplate(item.id)}
                className={`rounded-2xl border p-3 text-left ${localTemplate === item.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'}`}
              >
                <span className="font-display font-bold text-[var(--text)]">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{item.description}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { id: 'voice' as const, label: 'Speak', icon: Mic2 },
          { id: 'manual' as const, label: 'Type instead', icon: Keyboard },
        ].map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setInputMode(mode.id)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-display font-bold ${inputMode === mode.id ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]' : 'border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]'}`}
          >
            <mode.icon size={18} />
            {mode.label}
          </button>
        ))}
      </div>

      {inputMode === 'voice' ? (
        <Card padding="lg" className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-[var(--text)]">{plan === 'premium' ? '3 minutes' : '60 seconds'}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">The microphone is requested only when you press Start. Audio is used to write your documents. {plan === 'premium' ? 'Premium includes a 3-minute story.' : 'Premium extends this to 3 minutes.'}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface)] px-4 py-2 text-sm font-black uppercase tracking-widest text-[var(--muted)]" aria-live="polite">
              {isRecording ? 'Recording' : isPaused ? 'Paused' : isComplete ? 'Captured' : 'Ready'}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {talkingPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setPinnedPrompt(prompt)}
                className={`flex items-start gap-2 rounded-2xl border p-3 text-left text-sm ${pinnedPrompt === prompt ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
              >
                {pinnedPrompt === prompt ? <Pin size={16} className="mt-0.5 shrink-0" /> : <Check size={16} className="mt-0.5 shrink-0 opacity-40" />}
                {prompt}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <WaveformVisualizer isRecording={isRecording} isPaused={isPaused} isComplete={isComplete} getFrequencyData={getFrequencyData} />
          </div>

          <div className="flex flex-col items-center gap-5">
            <div className="font-display text-4xl font-extrabold text-[var(--text)] sm:text-5xl" aria-live="polite">{formattedTime}</div>
            <p className="text-center text-sm font-semibold text-[var(--text)]">Pinned prompt: {pinnedPrompt}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {(isRecording || isPaused) && (
                <Button variant="icon" aria-label={isPaused ? 'Resume recording' : 'Pause recording'} onClick={handleTogglePause}>
                  {isPaused ? <Play size={22} /> : <Pause size={22} />}
                </Button>
              )}
              <button
                ref={recordButtonRef}
                onClick={isRecording || isPaused ? handleStop : handleStart}
                disabled={isComplete}
                aria-label={isRecording || isPaused ? 'Stop recording' : 'Start recording'}
                className={`flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${isRecording || isPaused ? 'bg-[var(--warm)] text-[var(--bg)]' : 'bg-[var(--accent)] text-[var(--on-accent)]'}`}
              >
                {isRecording || isPaused ? <Square size={32} fill="currentColor" /> : <Mic2 size={34} />}
              </button>
              {isComplete && (
                <>
                  <Button variant="ghost" leftIcon={<RotateCcw size={16} />} onClick={() => setShowConfirm(true)}>Re-record</Button>
                  <Button variant="secondary" onClick={() => plan === 'premium' ? startNewRecording(true) : navigate('/upgrade')}>Add another take</Button>
                </>
              )}
            </div>
            <p className="text-xs text-[var(--muted)]">Press Space to start or stop when you are not typing.</p>
          </div>

          {audioError && <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold text-destructive" role="alert">{audioError}</div>}
          {speechNotice && <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]" role="status">{speechNotice}</div>}
          {isComplete && audioBlob && <AudioPlayback audioBlob={audioBlob} />}
        </Card>
      ) : (
        <Card padding="lg">
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">Type your career story</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Include your name, roles, skills, achievements, education, and the job you want next.</p>
        </Card>
      )}

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="transcript-review" className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Review the transcript</label>
          <span className="text-xs font-bold text-[var(--muted)]">{wordCount} words</span>
        </div>
        <textarea
          id="transcript-review"
          value={reviewedTranscript}
          onChange={(event) => setReviewedTranscript(event.target.value)}
          placeholder={inputMode === 'manual' ? 'Example: My name is Amina. I am a customer support specialist with three years of SaaS experience...' : 'Correct names, dates, and job titles here. A blank transcript still lets VoiceCV transcribe the audio.'}
          className="min-h-48 w-full resize-y rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
        {shortStory && (
          <p className="text-sm text-[var(--warm)]" role="status">This story is under about twenty words. A little more detail will make the documents stronger. You can still generate.</p>
        )}
        <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full" size="lg" rightIcon={<ArrowRight size={20} />}>
          Create my documents
        </Button>
      </Card>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md">
              <Card padding="lg" className="text-center">
                <h3 className="text-2xl font-display font-bold text-[var(--text)]">Start over?</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">This discards the current recording and transcript.</p>
                <div className="mt-7 flex flex-col gap-3">
                  <Button variant="destructive" onClick={handleDiscard}>Discard recording</Button>
                  <Button variant="ghost" onClick={() => setShowConfirm(false)}>Keep current recording</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
