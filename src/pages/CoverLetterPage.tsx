import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Building2, ArrowRight, Sparkles, RefreshCw, Copy, Download, Edit3, Save, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { personalizeCoverLetter } from '../lib/gemini';
import { CopyButton } from '../components/results/CopyButton';
import { DownloadButton } from '../components/results/DownloadButton';

export default function CoverLetterPage({ onToast }: { onToast: (msg: string, v: 'success' | 'error' | 'info') => void }) {
  const { assets, tone } = useVoiceCVStore();
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const handleGenerate = async () => {
    if (!assets?.resume) {
      onToast('Generate a resume first before creating a cover letter.', 'error');
      return;
    }
    if (!jobDescription.trim()) {
      onToast('Please paste a job description.', 'error');
      return;
    }
    setLoading(true);
    try {
      const letter = await personalizeCoverLetter({
        resume: assets.resume,
        jobDescription,
        companyName: companyName || undefined,
        tone,
      });
      setGeneratedLetter(letter);
      onToast('Cover letter generated successfully.', 'success');
    } catch (error) {
      const msg = error instanceof Error && error.message.includes('API key')
        ? 'Gemini API key is missing.'
        : 'Generation failed. Please try again.';
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditableContent(generatedLetter);
    setIsEditing(true);
  };

  const handleSave = () => {
    setGeneratedLetter(editableContent);
    setIsEditing(false);
    onToast('Changes saved.', 'success');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">AI Cover Letter Personalization</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-display font-extrabold text-[var(--text)]">Personalized cover letters for every application</h1>
        <p className="mt-4 text-[var(--muted)] max-w-2xl">Paste the job description and optionally add the company name. Gemini will research the context and write a tailored cover letter.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.5fr_1fr]">
        <div className="space-y-6">
          <Card variant="solid" padding="lg" className="space-y-5">
            <div className="flex items-center gap-3">
              <Building2 size={20} className="text-[var(--accent)]" />
              <h2 className="font-display text-xl font-bold text-[var(--text)]">Company Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Company name (optional)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Notion, Vercel..."
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
              </div>
              <div>
                <label className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Job description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="mt-2 min-h-48 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
              </div>
            </div>
            <Button onClick={handleGenerate} loading={loading} disabled={!jobDescription.trim() || !assets?.resume} className="w-full" size="lg" rightIcon={<Sparkles size={20} />}>
              Generate Personalized Cover Letter
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          {generatedLetter ? (
            <Card padding="none" className="overflow-hidden">
              <div className="space-y-4 border-b border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Personalized Letter</p>
                    <h2 className="mt-1 text-2xl font-display font-bold text-[var(--text)]">Cover Letter</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} leftIcon={<X size={16} />}>Cancel</Button>
                        <Button size="sm" onClick={handleSave} leftIcon={<Save size={16} />}>Save</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={handleEdit} leftIcon={<Edit3 size={16} />}>Edit</Button>
                        <CopyButton content={generatedLetter} onSuccess={(msg) => onToast(msg, 'success')} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-[600px] overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                {isEditing ? (
                  <textarea
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="h-full min-h-[540px] w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 font-mono text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    autoFocus
                  />
                ) : (
                  <article className="markdown-body max-w-none text-[var(--text)]">
                    <Markdown>{generatedLetter}</Markdown>
                  </article>
                )}
              </div>
            </Card>
          ) : (
            <Card variant="solid" padding="lg" className="text-center py-20">
              <Mail size={48} className="mx-auto mb-4 text-[var(--muted)] opacity-40" />
              <p className="text-[var(--muted)]">Paste a job description and click generate to create a personalized cover letter.</p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
