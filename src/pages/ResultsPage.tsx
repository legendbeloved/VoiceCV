import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Edit3, FileText, Gauge, HelpCircle, Linkedin, Mail, RefreshCw, Save, Sparkles, Target, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CopyButton } from '../components/results/CopyButton';
import { DownloadButton } from '../components/results/DownloadButton';
import { DocumentType, refineCareerDocument, RewriteAction } from '../lib/gemini';

const rewriteActions: Array<{ id: RewriteAction; label: string }> = [
  { id: 'stronger', label: 'Make stronger' },
  { id: 'shorter', label: 'Shorten' },
  { id: 'more-human', label: 'More human' },
  { id: 'more-formal', label: 'More formal' },
];

const templateLabels = {
  ats: 'Classic ATS',
  modern: 'Modern Compact',
  executive: 'Executive',
  creative: 'Creative',
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ResultsPage({ onReset, onToast }: { onReset: () => void, onToast: (msg: string, variant: 'success' | 'error' | 'info') => void }) {
  const { assets, transcript, tone, resumeTemplate, jobDescription, updateAssetField } = useVoiceCVStore();
  const [activeTab, setActiveTab] = useState<DocumentType>('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState<RewriteAction | null>(null);

  useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  if (!assets) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-display font-bold text-[var(--text)]">No documents yet</h1>
        <p className="mt-3 text-[var(--muted)]">Record or type a career story first so VoiceCV can generate your documents.</p>
        <Button onClick={onReset} className="mt-7">Start Recording</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'resume', label: 'Resume', icon: FileText, content: assets.resume },
    { id: 'coverLetter', label: 'Cover Letter', icon: Mail, content: assets.coverLetter },
    { id: 'linkedinBio', label: 'LinkedIn Bio', icon: Linkedin, content: assets.linkedinBio },
  ] as const;

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content || '';

  const handleEdit = () => {
    setEditableContent(activeContent);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateAssetField(activeTab, editableContent);
    setIsEditing(false);
    onToast('Changes saved.', 'success');
  };

  const handleRewrite = async (action: RewriteAction) => {
    setRewriteLoading(action);
    try {
      const revised = await refineCareerDocument({
        documentType: activeTab,
        content: activeContent,
        action,
        assets,
        tone,
      });
      updateAssetField(activeTab, revised);
      onToast('Document rewritten.', 'success');
    } catch (error) {
      const message = error instanceof Error && error.message.includes('API key')
        ? 'Gemini API key is missing. Add GEMINI_API_KEY to .env.local and restart.'
        : 'Rewrite failed. Please try again.';
      onToast(message, 'error');
    } finally {
      setRewriteLoading(null);
    }
  };

  const handleDownloadBundle = () => {
    const bundle = [
      `VoiceCV Bundle for ${assets.name}`,
      `Role: ${assets.role}`,
      `Template: ${templateLabels[resumeTemplate]}`,
      `Resume Score: ${assets.resumeScore.overall}/100`,
      '',
      'Transcript',
      assets.transcript || transcript,
      '',
      'Resume',
      assets.resume,
      '',
      'Cover Letter',
      assets.coverLetter,
      '',
      'LinkedIn Bio',
      assets.linkedinBio,
      '',
      'Missing Info Prompts',
      ...(assets.missingInfoPrompts.length ? assets.missingInfoPrompts.map((prompt) => `- ${prompt}`) : ['- No major gaps detected.']),
    ].join('\n');

    const blob = new Blob([bundle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${assets.name.replace(/\s+/g, '_')}_VoiceCV_Bundle.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<ArrowLeft size={16} />}>
            Re-record
          </Button>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">Generated profile</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-display font-extrabold text-[var(--text)]">{assets.name}</h1>
          <p className="mt-2 text-xl font-semibold text-[var(--muted)]">{assets.role}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button onClick={handleDownloadBundle} leftIcon={<Download size={16} />}>
            Download All Bundle
          </Button>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-xs font-black uppercase tracking-widest text-[var(--muted)]">
            Template: <span className="text-[var(--text)]">{templateLabels[resumeTemplate]}</span>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr_1fr]">
        <Card variant="solid" padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Resume quality score</h2>
              <p className="mt-3 text-5xl font-display font-extrabold text-[var(--text)]">{assets.resumeScore.overall}</p>
            </div>
            <Gauge size={34} className="text-[var(--accent)]" />
          </div>
          <div className="space-y-4">
            <ScoreBar label="Clarity" value={assets.resumeScore.clarity} />
            <ScoreBar label="ATS" value={assets.resumeScore.atsKeywords} />
            <ScoreBar label="Impact" value={assets.resumeScore.impact} />
            <ScoreBar label="Complete" value={assets.resumeScore.completeness} />
          </div>
        </Card>

        <Card variant="solid" padding="lg">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            <HelpCircle size={16} className="text-[var(--accent)]" />
            Missing info prompts
          </h2>
          <div className="mt-5 space-y-3">
            {(assets.missingInfoPrompts.length ? assets.missingInfoPrompts : ['No major gaps detected. You can still add metrics, links, or recent achievements to make it sharper.']).map((prompt) => (
              <div key={prompt} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--muted)]">
                {prompt}
              </div>
            ))}
          </div>
        </Card>

        <Card variant="solid" padding="lg">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            <Target size={16} className="text-[var(--accent)]" />
            Tailoring context
          </h2>
          <p className="mt-5 line-clamp-5 text-sm leading-7 text-[var(--muted)]">
            {jobDescription || 'No job description was pasted. The documents were generated from the candidate story and target role only.'}
          </p>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card variant="solid" padding="lg">
          <h2 className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Extracted strengths</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {assets.strengths.slice(0, 5).map((strength) => (
              <Badge key={strength} className="border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">{strength}</Badge>
            ))}
          </div>
        </Card>
        <Card variant="solid" padding="lg">
          <h2 className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">ATS keywords</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {assets.keywords.slice(0, 10).map((keyword) => (
              <Badge key={keyword} className="border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]">{keyword}</Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-3 overflow-x-auto lg:flex-col" role="tablist" aria-label="Generated documents">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-44 items-center gap-3 rounded-2xl border p-4 text-left transition-all ${activeTab === tab.id ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_16px_40px_rgba(46,92,255,0.2)]' : 'border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <tab.icon size={20} />
              <span className="font-display font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>

        <Card padding="none" className="min-h-[400px] sm:min-h-[500px] lg:min-h-[720px] overflow-hidden">
          <div className="space-y-4 border-b border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Ready to use</p>
                <h2 className="mt-1 text-2xl font-display font-bold text-[var(--text)]">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
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
                    <CopyButton content={activeContent} onSuccess={(msg) => onToast(msg, 'success')} />
                    <DownloadButton documentType={activeTab} content={activeContent} candidateName={assets.name} />
                  </>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="flex flex-wrap gap-2">
                {rewriteActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="secondary"
                    size="sm"
                    loading={rewriteLoading === action.id}
                    disabled={!!rewriteLoading}
                    onClick={() => handleRewrite(action.id)}
                    leftIcon={rewriteLoading === action.id ? undefined : <Sparkles size={14} />}
                  >
                    {action.label}
                  </Button>
                ))}
                {rewriteLoading && (
                  <span className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-[var(--muted)]">
                    <RefreshCw size={14} className="animate-spin" />
                    Rewriting with Gemini
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="h-[400px] sm:h-[500px] lg:h-[640px] overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
            {isEditing ? (
              <textarea
                value={editableContent}
                onChange={(event) => setEditableContent(event.target.value)}
                className="h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[540px] w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 font-mono text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                autoFocus
              />
            ) : (
              <article className="markdown-body max-w-none text-[var(--text)]">
                <Markdown>{activeContent}</Markdown>
              </article>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
