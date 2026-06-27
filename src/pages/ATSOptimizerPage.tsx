import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Search, ArrowRight, CheckCircle2, XCircle, RefreshCw, Sparkles, FileText, Copy } from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { analyzeATSMatch, ATSAnalysis } from '../lib/gemini';

export default function ATSOptimizerPage({ onToast }: { onToast: (msg: string, v: 'success' | 'error' | 'info') => void }) {
  const { assets } = useVoiceCVStore();
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!assets?.resume || !jobDescription.trim()) {
      onToast('Please paste a job description to analyze against.', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeATSMatch(assets.resume, jobDescription);
      setAnalysis(result);
      onToast('ATS analysis complete.', 'success');
    } catch (error) {
      const msg = error instanceof Error && error.message.includes('API key')
        ? 'Gemini API key is missing.'
        : 'Analysis failed. Please try again.';
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMissing = () => {
    if (analysis?.missingKeywords) {
      navigator.clipboard.writeText(analysis.missingKeywords.join(', '));
      onToast('Missing keywords copied to clipboard.', 'success');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">ATS Keyword Optimizer</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-display font-extrabold text-[var(--text)]">Optimize your resume for ATS systems</h1>
        <p className="mt-4 text-[var(--muted)] max-w-2xl">Paste a job description to compare your resume against it. Get a keyword match score, discover missing keywords, and receive rewrite suggestions.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
        <div className="space-y-6">
          <Card variant="solid" padding="lg" className="space-y-5">
            <div className="flex items-center gap-3">
              <Target size={20} className="text-[var(--accent)]" />
              <h2 className="font-display text-xl font-bold text-[var(--text)]">Job Description</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to compare against your resume..."
              className="min-h-48 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
            />
            <Button onClick={handleAnalyze} loading={loading} disabled={!jobDescription.trim() || !assets?.resume} className="w-full" size="lg" rightIcon={<ArrowRight size={20} />}>
              Analyze Resume vs Job Description
            </Button>
          </Card>

          {!assets?.resume && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
              <FileText size={32} className="mx-auto mb-3 text-[var(--muted)]" />
              <p className="text-sm text-[var(--muted)]">Generate a resume first by recording your career story, then come back to optimize it.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {analysis && (
            <>
              <Card variant="solid" padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[var(--text)]">Match Score</h2>
                  <Sparkles size={18} className="text-[var(--accent)]" />
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" strokeWidth="10" strokeDasharray={`${analysis.matchScore * 3.14} 314`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-display font-extrabold text-[var(--text)]">{analysis.matchScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">/ 100</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="solid" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[var(--text)]">Missing Keywords</h2>
                  <Button variant="ghost" size="sm" onClick={handleCopyMissing} leftIcon={<Copy size={14} />}>Copy</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.length ? analysis.missingKeywords.map((kw) => (
                    <Badge key={kw} className="bg-red-500/10 text-red-400 border-red-500/20">{kw}</Badge>
                  )) : <p className="text-sm text-[var(--muted)]">No missing keywords found.</p>}
                </div>
              </Card>

              <Card variant="solid" padding="lg" className="space-y-4">
                <h2 className="font-display text-lg font-bold text-[var(--text)]">Matched Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.map((kw) => (
                    <Badge key={kw} className="bg-green-500/10 text-green-400 border-green-500/20">{kw}</Badge>
                  ))}
                </div>
              </Card>

              {analysis.suggestedRewrites.length > 0 && (
                <Card variant="solid" padding="lg" className="space-y-4">
                  <h2 className="font-display text-lg font-bold text-[var(--text)]">Suggested Rewrites</h2>
                  <div className="space-y-3">
                    {analysis.suggestedRewrites.map((item, i) => (
                      <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-red-400">Original</p>
                        <p className="text-sm text-[var(--muted)]">{item.bullet}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-green-400">Suggested</p>
                        <p className="text-sm text-[var(--text)]">{item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {analysis.overallNotes.length > 0 && (
                <Card variant="solid" padding="lg" className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-[var(--text)]">Analysis Notes</h2>
                  {analysis.overallNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-[var(--muted)]">
                      <CheckCircle2 size={16} className="mt-0.5 text-[var(--accent)] shrink-0" />
                      {note}
                    </div>
                  ))}
                </Card>
              )}
            </>
          )}

          {!analysis && !loading && (
            <Card variant="solid" padding="lg" className="text-center py-16">
              <Search size={48} className="mx-auto mb-4 text-[var(--muted)] opacity-40" />
              <p className="text-[var(--muted)]">Paste a job description and click analyze to see your ATS match score.</p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
