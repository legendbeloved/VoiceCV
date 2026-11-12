import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Zap, Mic, Send, Bot, User as UserIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { draftInterviewQuestions, scoreInterviewSession } from '../lib/gemini';
import { listenOnce } from '../lib/speech';
import { usePlanStore } from '../store/usePlanStore';
import { usePackStore } from '../store/usePackStore';

export function InterviewSimulatorPage({ onToast }: { onToast: (m: string, v: any) => void }) {
  const navigate = useNavigate();
  const { assets, jobDescription } = useVoiceCVStore();
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: "Hello! I'm your AI hiring manager. We've reviewed your background. Are you ready to start our mock interview session?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [debrief, setDebrief] = useState<{ clarity: number; evidence: number; missing: string[]; summary: string } | null>(null);
  const [questions, setQuestions] = useState<Array<{ question: string; hint: string }>>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const plan = usePlanStore((state) => state.plan);
  const { activePackId, attachDebrief, packs } = usePackStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing');
      
      const ai = new GoogleGenAI({ apiKey });
      
      const context = `
        You are a supportive but professional hiring manager conducting a mock interview.
        The candidate's role: ${assets?.role || 'Professional'}
        The candidate's background: ${assets?.resume || 'Extracted from voice pitch'}
        Previous Prep Questions: ${assets?.interviewPrep || ''}
        
        Guidelines:
        1. Ask ONE question at a time.
        2. Provide brief, constructive feedback before moving to the next question.
        3. Stay in character.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat({ role: 'user', content: userMsg }).map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: { systemInstruction: context }
      });

      const text = response.text;

      setMessages(prev => [...prev, { role: 'ai', content: text }]);
    } catch (error) {
      console.error(error);
      onToast('AI could not respond. Check your API key.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const requirePremium = () => {
    if (plan === 'premium') return true;
    navigate('/upgrade');
    return false;
  };

  const handleVoice = async () => {
    if (!requirePremium()) return;
    setListening(true);
    try {
      const text = await listenOnce();
      setInputValue(text);
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Voice answer failed.', 'error');
    } finally {
      setListening(false);
    }
  };

  const handleQuestions = async () => {
    if (!requirePremium()) return;
    if (!assets) return;
    setQuestionsLoading(true);
    try {
      const next = await draftInterviewQuestions({
        role: assets.role,
        jobDescription,
        resume: assets.resume,
      });
      setQuestions(next);
      onToast(next.length ? 'Questions are ready from this job.' : 'No questions came back. Try again.', next.length ? 'success' : 'info');
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not write questions.', 'error');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleScore = async () => {
    if (!requirePremium()) return;
    const transcript = messages.map((message) => `${message.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${message.content}`).join('\n');
    setIsLoading(true);
    try {
      const result = await scoreInterviewSession(transcript, assets?.role || 'Professional');
      setDebrief(result);
      const packId = activePackId || packs[0]?.id;
      if (packId) attachDebrief(packId, result);
      onToast(packId ? 'Interview debrief saved on the application.' : 'Interview scored. Save an application to keep it.', 'success');
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Scoring failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!assets) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold">No Interview Prep Data</h2>
        <p className="max-w-md text-[var(--muted)]">Record a story first so the interviewer can use your resume.</p>
        <Button onClick={() => navigate('/record')}>Go to Recording</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex min-h-[70dvh] w-full max-w-[1000px] flex-col gap-4 pb-8 sm:gap-6 lg:h-[calc(100dvh-11rem)]"
    >
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-3 font-display text-2xl font-black tracking-tight sm:text-3xl">
            <MessageSquare size={28} className="shrink-0 text-emerald-400" />
            Interview Simulator
          </h1>
          <p className="text-sm text-[var(--muted)]">One question at a time, based on your resume.</p>
        </div>
        <div className="action-row">
        <Button variant="secondary" onClick={() => void handleQuestions()} loading={questionsLoading}>Questions from this job</Button>
        <Button variant="secondary" onClick={() => void handleScore()} disabled={isLoading}>Score this session</Button>
        </div>
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
          <Sparkles size={14} className="text-voice-amber" />
          <span className="min-w-0 text-[10px] font-black uppercase tracking-widest text-emerald-400">Context: {assets.role}</span>
        </div>
      </header>

      {questions.length > 0 && (
        <Card variant="solid" padding="lg" className="space-y-3">
          {questions.map((item) => (
            <div key={item.question}>
              <p className="text-sm font-bold text-[var(--text)]">{item.question}</p>
              {item.hint && <p className="mt-1 text-sm text-[var(--muted)]">{item.hint}</p>}
            </div>
          ))}
        </Card>
      )}

      <Card variant="solid" padding="none" className="relative flex flex-1 flex-col overflow-hidden">
        
        <div ref={scrollRef} className="relative z-10 flex-1 space-y-4 overflow-y-auto scroll-smooth p-4 sm:space-y-8 sm:p-8">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex min-w-0 max-w-[92%] gap-3 sm:max-w-[80%] sm:gap-4 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                  msg.role === 'ai' ? 'border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'
                }`}>
                  {msg.role === 'ai' ? <Bot size={20} /> : <UserIcon size={20} />}
                </div>
                <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'ai' ? 'rounded-tl-none bg-[var(--surface)] text-[var(--text)]' : 'rounded-tr-none bg-[var(--accent)] text-[var(--on-accent)]'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4 text-[var(--muted)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Hiring Manager is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 border-t border-[var(--border)] bg-[var(--panel)] p-3 sm:p-6">
          <div className="relative flex items-center gap-2 sm:gap-4">
            <input
              type="text"
              placeholder="Type your interview response..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--accent)] sm:px-6"
            />
            <Button variant="secondary" aria-label="Answer by voice" onClick={() => void handleVoice()} loading={listening}>
              <Mic size={18} />
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !inputValue}
              className="h-[52px] w-[52px] p-0 rounded-2xl flex items-center justify-center"
            >
              <Send size={20} />
            </Button>
          </div>
          {debrief && (
            <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
              <p className="font-bold">Clarity {debrief.clarity} · Evidence {debrief.evidence}</p>
              <p className="mt-2">{debrief.summary}</p>
              {debrief.missing.length > 0 && <p className="mt-2 text-[var(--muted)]">Add: {debrief.missing.join('; ')}</p>}
            </div>
          )}
          <div className="flex items-center justify-center mt-4">
             <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                <Mic size={10} />
                Pro Tip: Be concise and use the STAR method
             </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
