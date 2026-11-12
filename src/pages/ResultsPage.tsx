import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronDown, Download, Edit3, FileText, Gauge, HelpCircle, Linkedin, Mail, RefreshCw, Save, Sparkles, Target, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CopyButton } from '../components/results/CopyButton';
import { DownloadButton } from '../components/results/DownloadButton';
import { useAuth } from '../auth/AuthProvider';
import { applyMissingInfo, ATSAnalysis, DocumentType, draftOutreach, refineCareerDocument, RewriteAction, tailorDocumentsToJob, translateCareerDocuments } from '../lib/gemini';
import { listenOnce } from '../lib/speech';
import { canUseFreeAction, recordFreeAction, usePlanStore } from '../store/usePlanStore';
import { usePackStore } from '../store/usePackStore';

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
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function ResultsPage({ onReset, onToast }: { onReset: () => void, onToast: (msg: string, variant: 'success' | 'error' | 'info') => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    assets,
    transcript,
    tone,
    resumeTemplate,
    jobDescription,
    jobRole,
    companyName,
    setCompanyName,
    setJobDescription,
    updateAssetField,
    versions,
    pushVersion,
    restoreVersion,
    answeredPrompts,
    markPromptAnswered,
  } = useVoiceCVStore();
  const [activeTab, setActiveTab] = useState<DocumentType>('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState<RewriteAction | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
  const [gapLoading, setGapLoading] = useState<string | null>(null);
  const [tailorDescription, setTailorDescription] = useState(jobDescription);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionBox, setVersionBox] = useState({ top: 0, left: 0, width: 288 });
  const versionButtonRef = useRef<HTMLDivElement>(null);
  const versionMenuRef = useRef<HTMLDivElement>(null);
  const [outputLanguage, setOutputLanguage] = useState('French');
  const [translating, setTranslating] = useState(false);
  const [listeningPrompt, setListeningPrompt] = useState<string | null>(null);
  const plan = usePlanStore((state) => state.plan);
  const { savePack, activePackId, attachTranslation, attachOutreach } = usePackStore();
  const [outreach, setOutreach] = useState('');
  const [outreachLoading, setOutreachLoading] = useState<'brief' | 'follow-up' | 'thank-you' | null>(null);

  useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  useEffect(() => {
    if (!versionOpen) return;
    const place = () => {
      const rect = versionButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(288, window.innerWidth - 24);
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      setVersionBox({ top: rect.bottom + 8, left, width });
    };
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (versionButtonRef.current?.contains(target) || versionMenuRef.current?.contains(target)) return;
      setVersionOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVersionOpen(false);
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [versionOpen]);

  if (!assets) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-display font-bold text-[var(--text)]">No documents yet</h1>
        <p className="mt-3 text-[var(--muted)]">Record or import a career story first so VoiceCV can open your documents here.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button onClick={onReset}>Start recording</Button>
          <Button variant="secondary" onClick={() => navigate('/import')}>Import a resume</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'resume' as const, label: 'Resume', icon: FileText, content: assets.resume },
    { id: 'coverLetter' as const, label: 'Cover Letter', icon: Mail, content: assets.coverLetter },
    { id: 'linkedinBio' as const, label: 'LinkedIn Bio', icon: Linkedin, content: assets.linkedinBio },
  ];
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content || '';
  const prompts = assets.missingInfoPrompts.length ? assets.missingInfoPrompts : [];

  const handleEdit = () => {
    setEditableContent(activeContent);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateAssetField(activeTab, editableContent);
    pushVersion('Edited by hand');
    setIsEditing(false);
    onToast('Changes saved.', 'success');
  };

  const handleRewrite = async (action: RewriteAction) => {
    if (!canUseFreeAction('rewrites')) {
      onToast('The first rewrite is free. Further rewrites are Premium.', 'info');
      navigate('/upgrade');
      return;
    }
    setRewriteLoading(action);
    try {
      const source = isEditing ? editableContent : activeContent;
      const revised = await refineCareerDocument({
        documentType: activeTab,
        content: source,
        action,
        assets,
        tone,
      });
      updateAssetField(activeTab, revised);
      if (isEditing) setEditableContent(revised);
      pushVersion(rewriteActions.find((item) => item.id === action)?.label || 'Rewrite');
      recordFreeAction('rewrites');
      onToast('Document rewritten. The previous version is in the version list.', 'success');
    } catch (error) {
      const message = error instanceof Error && error.message.includes('API key')
        ? 'VoiceCV AI configuration is missing. Add GEMINI_API_KEY to .env.local and restart.'
        : 'Rewrite failed. Please try again.';
      onToast(message, 'error');
    } finally {
      setRewriteLoading(null);
    }
  };

  const handleGap = async (prompt: string) => {
    const answer = gapAnswers[prompt]?.trim();
    if (!answer) return;
    setGapLoading(prompt);
    try {
      const updated = await applyMissingInfo({ assets, prompt, answer });
      updateAssetField('resume', updated.resume);
      updateAssetField('coverLetter', updated.coverLetter);
      updateAssetField('linkedinBio', updated.linkedinBio);
      markPromptAnswered(prompt);
      pushVersion('Added a missing detail');
      onToast('That detail is now in the documents.', 'success');
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not apply that answer.', 'error');
    } finally {
      setGapLoading(null);
    }
  };

  const handleTailor = async () => {
    if (!tailorDescription.trim()) {
      onToast('Paste a job description first.', 'info');
      return;
    }
    if (!canUseFreeAction('tailors')) {
      onToast('The first tailor is free. Each extra job is Premium.', 'info');
      navigate('/upgrade');
      return;
    }
    setTailorLoading(true);
    try {
      setJobDescription(tailorDescription);
      const result = await tailorDocumentsToJob({
        assets,
        jobDescription: tailorDescription,
        companyName,
        targetRole: jobRole || assets.role,
        tone,
      });
      updateAssetField('resume', result.resume);
      updateAssetField('coverLetter', result.coverLetter);
      setAnalysis(result.analysis);
      pushVersion(companyName ? `${assets.role} · ${companyName}` : `Tailored · ${jobRole || assets.role}`);
      recordFreeAction('tailors');
      onToast('Resume and cover letter were tailored. The earlier version is still in the list.', 'success');
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Tailoring failed.', 'error');
    } finally {
      setTailorLoading(false);
    }
  };

  const handleSavePack = () => {
    const saved = savePack({
      id: activePackId || undefined,
      name: companyName ? `${assets.role} · ${companyName}` : assets.role,
      company: companyName,
      role: jobRole || assets.role,
      jobDescription,
      resume: assets.resume,
      coverLetter: assets.coverLetter,
      linkedinBio: assets.linkedinBio,
      language: 'English',
      matchScore: analysis?.matchScore ?? assets.resumeScore.overall,
      matchedKeywords: analysis?.matchedKeywords || assets.keywords,
      missingKeywords: analysis?.missingKeywords || [],
      themeId: window.localStorage.getItem('voicecv-resume-theme') || 'voyager',
    });
    if (!saved.ok) {
      onToast('Free keeps one application. Premium keeps a pack for every job.', 'info');
      navigate('/upgrade');
      return;
    }
    onToast('Application saved in the vault.', 'success');
  };

  const handleTranslate = async () => {
    if (plan !== 'premium') {
      navigate('/upgrade');
      return;
    }
    setTranslating(true);
    try {
      const translated = await translateCareerDocuments({ assets, language: outputLanguage });
      updateAssetField('resume', translated.resume);
      updateAssetField('coverLetter', translated.coverLetter);
      updateAssetField('linkedinBio', translated.linkedinBio);
      if (activePackId) attachTranslation(activePackId, outputLanguage, translated);
      pushVersion(`Translated to ${outputLanguage}`);
      onToast(`Documents translated to ${outputLanguage}.`, 'success');
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Translation failed.', 'error');
    } finally {
      setTranslating(false);
    }
  };

  const answerByVoice = async (prompt: string) => {
    if (plan !== 'premium') {
      navigate('/upgrade');
      return;
    }
    setListeningPrompt(prompt);
    try {
      const text = await listenOnce();
      setGapAnswers((current) => ({ ...current, [prompt]: text }));
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Voice answer failed.', 'error');
    } finally {
      setListeningPrompt(null);
    }
  };

  const handleOutreach = async (kind: 'brief' | 'follow-up' | 'thank-you') => {
    if (plan !== 'premium') {
      onToast('Company briefs, follow-ups, and thank-you notes are Premium.', 'info');
      navigate('/upgrade');
      return;
    }
    setOutreachLoading(kind);
    try {
      const text = await draftOutreach({
        assets,
        company: companyName,
        role: jobRole || assets.role,
        jobDescription: tailorDescription || jobDescription,
        kind,
      });
      setOutreach(text);
      if (activePackId) attachOutreach(activePackId, kind, text);
      onToast(activePackId ? 'Saved on this application.' : 'Note ready. Save the application to keep it.', 'success');
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not write that note.', 'error');
    } finally {
      setOutreachLoading(null);
    }
  };

  const handleDownloadBundle = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/results' } } });
      return;
    }
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
      plan === 'premium' ? '' : '\nMade with VoiceCV',
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

  const coach = (
    <div className="space-y-4">
      <Card variant="solid" padding="lg" className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">Resume score</h2>
            <p className="mt-2 text-5xl font-display font-extrabold text-[var(--text)]">{assets.resumeScore.overall}</p>
          </div>
          <Gauge size={32} className="text-[var(--accent)]" />
        </div>
        <ScoreBar label="Clarity" value={assets.resumeScore.clarity} />
        <ScoreBar label="ATS keywords" value={assets.resumeScore.atsKeywords} />
        <ScoreBar label="Impact" value={assets.resumeScore.impact} />
        <ScoreBar label="Completeness" value={assets.resumeScore.completeness} />
      </Card>

      <Card variant="solid" padding="lg" className="space-y-4">
        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
          <HelpCircle size={16} className="text-[var(--accent)]" />
          Details that would help
        </h2>
        {prompts.length === 0 && <p className="text-sm leading-6 text-[var(--muted)]">No major gaps were flagged. You can still tailor the documents to a job.</p>}
        {prompts.map((prompt) => {
          const answered = answeredPrompts.includes(prompt);
          return (
            <div key={prompt} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm leading-6 text-[var(--text)]">{prompt}</p>
              {answered ? (
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-600">Added</p>
              ) : (
                <>
                  <label className="mt-3 block text-xs font-bold uppercase tracking-widest text-[var(--muted)]" htmlFor={`gap-${prompt}`}>Your answer</label>
                  <textarea
                    id={`gap-${prompt}`}
                    value={gapAnswers[prompt] || ''}
                    onChange={(event) => setGapAnswers((current) => ({ ...current, [prompt]: event.target.value }))}
                    className="mt-2 min-h-20 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" loading={listeningPrompt === prompt} onClick={() => void answerByVoice(prompt)}>Answer by voice</Button>
                    <Button size="sm" loading={gapLoading === prompt} disabled={!!gapLoading} onClick={() => void handleGap(prompt)}>Update the documents</Button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </Card>

      <Card variant="solid" padding="lg" className="space-y-4">
        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
          <Target size={16} className="text-[var(--accent)]" />
          Tailor to a job
        </h2>
        <label htmlFor="company-name" className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Company</label>
        <input
          id="company-name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="Optional company name"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
        <label htmlFor="tailor-job" className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Job description</label>
        <textarea
          id="tailor-job"
          value={tailorDescription}
          onChange={(event) => setTailorDescription(event.target.value)}
          className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm leading-6 text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
        <Button onClick={handleTailor} loading={tailorLoading} disabled={tailorLoading}>Tailor resume and letter</Button>
        {plan !== 'premium' && <p className="text-xs text-[var(--muted)]">The first tailor is free. Each extra job is Premium.</p>}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="output-language" className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Also write in</label>
          <select id="output-language" value={outputLanguage} onChange={(event) => setOutputLanguage(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)]">
            {['French', 'Spanish', 'Arabic', 'Portuguese', 'German'].map((language) => <option key={language}>{language}</option>)}
          </select>
          <Button size="sm" variant="secondary" loading={translating} onClick={() => void handleTranslate()}>Translate</Button>
        </div>
        <div className="space-y-3 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Notes for this job</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" loading={outreachLoading === 'brief'} disabled={!!outreachLoading} onClick={() => void handleOutreach('brief')}>Company brief</Button>
            <Button size="sm" variant="secondary" loading={outreachLoading === 'follow-up'} disabled={!!outreachLoading} onClick={() => void handleOutreach('follow-up')}>Follow-up email</Button>
            <Button size="sm" variant="secondary" loading={outreachLoading === 'thank-you'} disabled={!!outreachLoading} onClick={() => void handleOutreach('thank-you')}>Thank-you note</Button>
          </div>
          {outreach && <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--text)]">{outreach}</p>}
        </div>
        {analysis && (
          <div className="space-y-3 text-sm">
            <p className="font-bold text-[var(--text)]">Keyword match {analysis.matchScore}</p>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedKeywords.slice(0, 8).map((keyword) => (
                <Badge key={`in-${keyword}`}>Present · {keyword}</Badge>
              ))}
              {analysis.missingKeywords.slice(0, 8).map((keyword) => (
                <Badge key={`out-${keyword}`} className="border-[var(--border)]">Missing · {keyword}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        {assets.strengths.slice(0, 5).map((strength) => (
          <Badge key={strength}>{strength}</Badge>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-6 pb-24">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<ArrowLeft size={16} />}>Re-record</Button>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-[var(--text)] sm:text-4xl">{assets.name}</h1>
          <p className="mt-2 text-base font-semibold text-[var(--muted)] sm:text-lg">{assets.role}</p>
        </div>
        <div className="action-row">
          <div ref={versionButtonRef}>
            <Button variant="secondary" size="sm" onClick={() => setVersionOpen((open) => !open)} rightIcon={<ChevronDown size={14} />} aria-expanded={versionOpen} aria-haspopup="menu">
              Versions ({versions.length})
            </Button>
            {versionOpen && createPortal(
              <div
                ref={versionMenuRef}
                role="menu"
                aria-label="Document versions"
                style={{ top: versionBox.top, left: versionBox.left, width: versionBox.width }}
                className="fixed z-[80] max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-[var(--shadow)]"
              >
                {versions.length === 0 && <p className="p-3 text-sm text-[var(--muted)]">Versions appear after you generate, edit, or tailor.</p>}
                {versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-xl px-3 py-2 text-left hover:bg-[var(--surface)]"
                    onClick={() => {
                      restoreVersion(version.id);
                      setVersionOpen(false);
                      onToast(`Restored “${version.label}”.`, 'success');
                    }}
                  >
                    <span className="block break-words text-sm font-bold text-[var(--text)]">{version.label}</span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">{new Date(version.createdAt).toLocaleString()}</span>
                  </button>
                ))}
              </div>,
              document.body,
            )}
          </div>
          <Button size="sm" variant="secondary" onClick={handleSavePack}>Save application</Button>
          <Button size="sm" onClick={handleDownloadBundle} leftIcon={<Download size={16} />}>Download bundle</Button>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="flex gap-2 overflow-x-auto border-b border-[var(--border)] p-3" role="tablist" aria-label="Generated documents">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${activeTab === tab.id ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface)]'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="sticky top-20 z-10 space-y-3 border-b border-[var(--border)] bg-[var(--surface)] p-4">
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
                  <DownloadButton documentType={activeTab} content={activeContent} candidateName={assets.name} assets={assets} />
                </>
              )}
            </div>
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
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
                  <RefreshCw size={14} className="animate-spin" />
                  Rewriting
                </span>
              )}
            </div>
            {plan !== 'premium' && <p className="text-xs text-[var(--muted)]">The first rewrite is free. Further rewrites are Premium.</p>}
          </div>
          <div className="p-4 sm:p-6">
            {isEditing ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <textarea
                  value={editableContent}
                  onChange={(event) => setEditableContent(event.target.value)}
                  aria-label={`Edit ${tabs.find((tab) => tab.id === activeTab)?.label}`}
                  className="min-h-[420px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <article className="markdown-body min-h-[420px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-[var(--text)]">
                  <Markdown>{editableContent}</Markdown>
                </article>
              </div>
            ) : (
              <article className={`markdown-body mx-auto max-w-3xl rounded-2xl border p-6 sm:p-10 ${activeTab === 'resume' ? 'resume-sheet' : 'border-[var(--border)] bg-[var(--panel)] text-[var(--text)]'}`}>
                <Markdown>{activeContent}</Markdown>
              </article>
            )}
          </div>
        </Card>

        <aside className="hidden lg:block">{coach}</aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg)] p-3 lg:hidden">
        <Button className="w-full" variant="secondary" onClick={() => setCoachOpen(true)}>Score and suggestions</Button>
      </div>
      {coachOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/40" aria-label="Close suggestions" onClick={() => setCoachOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[var(--text)]">Score and suggestions</h2>
              <Button variant="ghost" size="sm" onClick={() => setCoachOpen(false)}>Close</Button>
            </div>
            {coach}
          </div>
        </div>
      )}
    </motion.div>
  );
}
