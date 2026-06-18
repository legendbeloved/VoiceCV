import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, FileText, Keyboard, Mic2, Pause, Play, RotateCcw, Square, Wand2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
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

const tones: Array<{ id: ToneStyle; label: string }> = [
  { id: 'professional', label: 'Professional' },
  { id: 'warm', label: 'Warm' },
  { id: 'executive', label: 'Executive' },
  { id: 'confident', label: 'Confident' },
  { id: 'creative', label: 'Creative' },
];

const templates: Array<{ id: ResumeTemplate; label: string; description: string }> = [
  { id: 'ats', label: 'Classic ATS', description: 'Clean headings and recruiter-friendly bullets.' },
  { id: 'modern', label: 'Modern Compact', description: 'Tight summary, skills up top, easy scanning.' },
  { id: 'executive', label: 'Executive', description: 'Leadership profile and business impact first.' },
  { id: 'creative', label: 'Creative', description: 'More personality while staying ATS-readable.' },
];

export function RecordPage({ onSubmit }: RecordPageProps) {
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
    setTranscript,
  } = useVoiceCVStore();
  const [inputMode, setInputMode] = useState<'voice' | 'manual'>('voice');
  const [transcription, setTranscription] = useState('');
  const [reviewedTranscript, setReviewedTranscript] = useState('');
  const [localJobRole, setLocalJobRole] = useState(jobRole);
  const [localJobDescription, setLocalJobDescription] = useState(jobDescription);
  const [localTone, setLocalTone] = useState<ToneStyle>(tone);
  const [localTemplate, setLocalTemplate] = useState<ResumeTemplate>(resumeTemplate);
  const [showConfirm, setShowConfirm] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

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
  const canGenerate = reviewedTranscript.trim().length > 12 || (inputMode === 'voice' && !!audioBlob);

  useEffect(() => {
    const timer = setTimeout(() => {
      setJobRole(localJobRole);
      setJobDescription(localJobDescription);
      setTone(localTone);
      setResumeTemplate(localTemplate);
    }, 200);
    return () => clearTimeout(timer);
  }, [localJobRole, localJobDescription, localTone, localTemplate, setJobRole, setJobDescription, setTone, setResumeTemplate]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechNotice('Live transcript is not supported in this browser. Gemini will still process your recorded audio after you submit.');
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
      const nextTranscript = `${finalTranscriptRef.current}${interimTranscript}`.trim();
      setTranscription(nextTranscript);
      setReviewedTranscript(nextTranscript);
    };
    recognition.onerror = () => {
      setSpeechNotice('Live transcript paused. Your audio recording is still saved for Gemini processing.');
    };
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  const startNewRecording = () => {
    finalTranscriptRef.current = '';
    setTranscription('');
    setReviewedTranscript('');
    setTranscript('');
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

  const handleGenerate = () => {
    const cleanedTranscript = reviewedTranscript.trim();
    setJobRole(localJobRole);
    setJobDescription(localJobDescription);
    setTone(localTone);
    setResumeTemplate(localTemplate);
    setTranscript(cleanedTranscript);
    onSubmit({
      audioBlob: inputMode === 'voice' ? audioBlob : null,
      transcriptHint: cleanedTranscript,
      jobDescription: localJobDescription,
      tone: localTone,
      resumeTemplate: localTemplate,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.86fr_1fr]"
    >
      <section className="space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">Setup</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-display font-extrabold text-[var(--text)]">Give Gemini the right context before it writes.</h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Record your voice or type your story, paste a job description, then review the transcript before generating.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'voice', label: 'Voice', icon: Mic2 },
            { id: 'manual', label: 'Manual', icon: Keyboard },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setInputMode(mode.id as 'voice' | 'manual')}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-display font-bold transition-all ${inputMode === mode.id ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]' : 'border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <mode.icon size={18} />
              {mode.label}
            </button>
          ))}
        </div>

        <Input
          label="Target role or keywords"
          placeholder="Frontend Developer, Customer Success, Product Lead..."
          value={localJobRole}
          onChange={(event) => setLocalJobRole(event.target.value)}
          helperText="Optional. Used for title, keywords, resume summary, and cover letter positioning."
        />

        <div className="space-y-2">
          <label htmlFor="job-description" className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Job description paste-in
          </label>
          <textarea
            id="job-description"
            value={localJobDescription}
            onChange={(event) => setLocalJobDescription(event.target.value)}
            placeholder="Paste the job post here so VoiceCV can tailor keywords and positioning..."
            className="min-h-36 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-6 py-4 text-sm leading-7 text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
        </div>

        <Card variant="solid" padding="lg" className="space-y-5">
          <div className="flex items-center gap-3">
            <Wand2 size={20} className="text-[var(--accent)]" />
            <h2 className="font-display text-xl font-bold text-[var(--text)]">Tone selector</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tones.map((item) => (
              <button
                key={item.id}
                onClick={() => setLocalTone(item.id)}
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${localTone === item.id ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        <Card variant="solid" padding="lg" className="space-y-5">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-[var(--accent)]" />
            <h2 className="font-display text-xl font-bold text-[var(--text)]">Resume templates</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((item) => (
              <button
                key={item.id}
                onClick={() => setLocalTemplate(item.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${localTemplate === item.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--surface)]'}`}
              >
                <span className="font-display font-bold text-[var(--text)]">{item.label}</span>
                <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">{item.description}</span>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <Card padding="lg" className="space-y-8">
          {inputMode === 'voice' ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Voice note</p>
                  <h2 className="mt-2 text-2xl font-display font-bold text-[var(--text)]">60 seconds max</h2>
                </div>
                <div className={`rounded-2xl px-4 py-2 text-sm font-black uppercase tracking-widest ${isRecording ? 'bg-[var(--warm-soft)] text-[var(--warm)]' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                  {isRecording ? 'Recording' : isComplete ? 'Captured' : 'Ready'}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <WaveformVisualizer
                  isRecording={isRecording}
                  isPaused={isPaused}
                  isComplete={isComplete}
                  getFrequencyData={getFrequencyData}
                />
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="text-5xl font-display font-extrabold text-[var(--text)]" aria-live="polite">
                  {formattedTime}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <AnimatePresence>
                    {(isRecording || isPaused) && (
                      <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                        <Button variant="icon" aria-label={isPaused ? 'Resume recording' : 'Pause recording'} onClick={handleTogglePause}>
                          {isPaused ? <Play size={22} /> : <Pause size={22} />}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={isRecording || isPaused ? handleStop : handleStart}
                    disabled={isComplete}
                    aria-label={isRecording || isPaused ? 'Stop recording' : 'Start recording'}
                    className={`relative h-24 w-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isRecording || isPaused ? 'bg-[var(--warm)] text-[var(--bg)]' : 'bg-[var(--accent)] text-[var(--on-accent)]'}`}
                  >
                    {isRecording || isPaused ? <Square size={32} fill="currentColor" /> : <Mic2 size={34} />}
                  </button>

                  <AnimatePresence>
                    {isComplete && (
                      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                        <Button variant="ghost" leftIcon={<RotateCcw size={16} />} onClick={() => setShowConfirm(true)}>
                          Re-record
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {audioError && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold text-destructive" role="alert">
                  {audioError}
                </div>
              )}

              {speechNotice && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]" role="status">
                  {speechNotice}
                </div>
              )}

              {isComplete && audioBlob && <AudioPlayback audioBlob={audioBlob} />}
            </>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Manual text input mode</p>
                <h2 className="mt-2 text-2xl font-display font-bold text-[var(--text)]">Type or paste your career story</h2>
              </div>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Include your name, current or past roles, key skills, achievements, education, and the kind of job you want.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <label htmlFor="transcript-review" className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
              Transcript review before generation
            </label>
            <textarea
              id="transcript-review"
              value={reviewedTranscript}
              onChange={(event) => setReviewedTranscript(event.target.value)}
              placeholder={inputMode === 'manual' ? 'Example: My name is Amina. I am a customer support specialist with three years of SaaS experience...' : 'Review or correct the live transcript here. If it is blank, Gemini can still transcribe the audio directly.'}
              className="min-h-48 w-full resize-y rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
            />
          </div>

          <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full" size="lg" rightIcon={<ArrowRight size={20} />}>
            Generate Career Documents
          </Button>
        </Card>
      </section>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md">
              <Card padding="lg" className="text-center">
                <h3 className="text-2xl font-display font-bold text-[var(--text)]">Start over?</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">This will discard the current recording and transcript review text.</p>
                <div className="mt-7 flex flex-col gap-3">
                  <Button variant="destructive" onClick={handleDiscard}>Discard Recording</Button>
                  <Button variant="ghost" onClick={() => setShowConfirm(false)}>Keep Current Recording</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
