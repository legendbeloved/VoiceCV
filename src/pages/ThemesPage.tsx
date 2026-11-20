import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Palette, Check, Sparkles, Eye, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useVoiceCVStore } from '../store/useVoiceCVStore';

type ResumeLook = {
  id: string;
  name: string;
  description: string;
  paper: string;
  ink: string;
  accent: string;
  premium: boolean;
};

const THEMES: ResumeLook[] = [
  { id: 'voyager', name: 'The Voyager', description: 'Blue headings on a cool paper background.', paper: '#f4f7ff', ink: '#172033', accent: '#1e4fc7', premium: false },
  { id: 'minimalist', name: 'The Minimalist', description: 'Black text on white, with no extra color.', paper: '#ffffff', ink: '#111111', accent: '#111111', premium: false },
  { id: 'neon', name: 'Neon Architect', description: 'Teal headings on a dark page for technical roles.', paper: '#071018', ink: '#d7fff8', accent: '#5eead4', premium: true },
  { id: 'executive', name: 'The Executive', description: 'Warm paper and rust headings for leadership roles.', paper: '#fbf7f0', ink: '#1e293b', accent: '#9a3412', premium: true },
  { id: 'harbor', name: 'Harbor', description: 'Teal headings on a cool coastal paper.', paper: '#f3f7f8', ink: '#14343c', accent: '#0f6e78', premium: false },
  { id: 'sage', name: 'Sage', description: 'Green headings on a soft paper background.', paper: '#f4f7f2', ink: '#1f2a22', accent: '#3f6b4a', premium: false },
  { id: 'ink', name: 'Ink', description: 'Editorial red headings on warm white paper.', paper: '#fffdf8', ink: '#1a1a1a', accent: '#9f1239', premium: true },
  { id: 'dusk', name: 'Dusk', description: 'Plum headings on a rose paper background.', paper: '#f8f1f6', ink: '#2a1b2e', accent: '#7c3a5f', premium: true },
];

const CUSTOM_KEY = 'voicecv-custom-resume-theme';

function readCustomTheme(): ResumeLook | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CUSTOM_KEY) || '');
    if (!parsed?.paper || !parsed?.ink || !parsed?.accent) return null;
    return { id: 'custom', name: parsed.name || 'Custom', description: 'Saved in this browser.', paper: parsed.paper, ink: parsed.ink, accent: parsed.accent, premium: false };
  } catch {
    return null;
  }
}

function paintCustomTheme(theme: ResumeLook) {
  document.documentElement.style.setProperty('--resume-paper', theme.paper);
  document.documentElement.style.setProperty('--resume-ink', theme.ink);
  document.documentElement.style.setProperty('--resume-accent', theme.accent);
}

function ResumeSample({ theme, name, role, lines }: { theme: ResumeLook; name: string; role: string; lines: string[] }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border p-4 text-left shadow-sm" style={{ background: theme.paper, color: theme.ink, borderColor: theme.accent }}>
      <p className="font-display text-base font-bold leading-tight" style={{ color: theme.accent }}>{name}</p>
      <p className="mt-1 text-xs">{role}</p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Experience</p>
      <ul className="mt-2 space-y-1">
        {lines.map((line) => <li key={line} className="text-xs leading-5">{line}</li>)}
      </ul>
    </article>
  );
}

export default function ThemesPage() {
  const assets = useVoiceCVStore((state) => state.assets);
  const [currentThemeId, setCurrentThemeId] = useState(() => window.localStorage.getItem('voicecv-resume-theme') || 'voyager');
  const [customTheme, setCustomTheme] = useState<ResumeLook | null>(() => readCustomTheme());
  const [preview, setPreview] = useState<ResumeLook | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [draftName, setDraftName] = useState('My theme');
  const [draftPaper, setDraftPaper] = useState('#fffdf8');
  const [draftInk, setDraftInk] = useState('#1a1a1a');
  const [draftAccent, setDraftAccent] = useState('#1e4fc7');
  const themes = customTheme ? [...THEMES, customTheme] : THEMES;
  const sampleName = assets?.name || 'Amina Okonkwo';
  const sampleRole = assets?.role || 'Customer Support Lead';
  const sampleLines = ['Cut first-response time by 20% across a SaaS support queue.', 'Coached six agents and kept CSAT above 94%.'];

  useEffect(() => {
    window.localStorage.setItem('voicecv-resume-theme', currentThemeId);
    document.documentElement.dataset.resumeTheme = currentThemeId;
    if (currentThemeId === 'custom' && customTheme) paintCustomTheme(customTheme);
  }, [currentThemeId, customTheme]);

  useEffect(() => {
    if (!preview && !requestOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreview(null);
        setRequestOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview, requestOpen]);

  const saveCustomTheme = () => {
    const next: ResumeLook = {
      id: 'custom',
      name: draftName.trim() || 'My theme',
      description: 'Saved in this browser.',
      paper: draftPaper,
      ink: draftInk,
      accent: draftAccent,
      premium: false,
    };
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    setCustomTheme(next);
    setCurrentThemeId('custom');
    setRequestOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
      <header className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-4">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="w-16 h-16 bg-brand-violet/20 rounded-3xl flex items-center justify-center text-brand-violet mx-auto mb-6">
          <Palette size={32} />
        </motion.div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase">Visual Identity</h1>
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[var(--muted)]">Resume Themes Gallery</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {themes.map((theme, idx) => (
          <motion.div key={theme.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <GlassPanel className="p-0 overflow-hidden group border-white/10 hover:border-brand-violet/50 transition-all shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-5 h-full min-h-[340px]">
                <div className="md:col-span-2 p-4">
                  <ResumeSample theme={theme} name={sampleName} role={sampleRole} lines={sampleLines} />
                </div>
                <div className="md:col-span-3 p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-void-indigo/40 lg:backdrop-blur-none">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="text-2xl font-display font-black text-[var(--text)] group-hover:text-brand-violet transition-colors">{theme.name}</h3>
                      {theme.premium && <Badge className="bg-voice-amber/10 text-voice-amber border-voice-amber/20 flex gap-1"><Sparkles size={10} /> Premium</Badge>}
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{theme.description}</p>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <Button variant={currentThemeId === theme.id ? 'secondary' : 'primary'} className="flex-1" disabled={currentThemeId === theme.id} onClick={() => setCurrentThemeId(theme.id)}>
                      {currentThemeId === theme.id ? <span className="flex items-center gap-2"><Check size={16} /> Current</span> : 'Apply Theme'}
                    </Button>
                    <Button variant="ghost" className="w-12 px-0" aria-label={`Preview ${theme.name}`} onClick={() => setPreview(theme)}>
                      <Eye size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-16 sm:mt-24 lg:mt-32 p-6 sm:p-8 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4 text-[var(--text)]">Build a theme from your own colors</h2>
        <p className="mx-auto mb-8 max-w-xl text-sm text-[var(--muted)] sm:text-base">Choose a paper color, a text color, and a heading color. VoiceCV saves that theme in this browser and uses it on the resume.</p>
        <Button variant="secondary" className="px-8 sm:px-12 h-12 sm:h-14 rounded-2xl" onClick={() => setRequestOpen(true)}>Request custom theme</Button>
      </motion.div>

      {preview && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="theme-preview-title">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="theme-preview-title" className="font-display text-2xl font-bold text-[var(--text)]">{preview.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">This is how a resume looks in this theme. Applying it does not change your words.</p>
              </div>
              <button type="button" aria-label="Close preview" onClick={() => setPreview(null)} className="rounded-xl border border-[var(--border)] p-2 text-[var(--text)]"><X size={16} /></button>
            </div>
            <ResumeSample theme={preview} name={sampleName} role={sampleRole} lines={sampleLines} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => { setCurrentThemeId(preview.id); setPreview(null); }}>Use this theme</Button>
              <Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {requestOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="custom-theme-title">
          <form className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-6" onSubmit={(event) => { event.preventDefault(); saveCustomTheme(); }}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="custom-theme-title" className="font-display text-2xl font-bold text-[var(--text)]">Custom theme</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">These colors are saved in this browser and applied to the resume straight away.</p>
              </div>
              <button type="button" aria-label="Close custom theme" onClick={() => setRequestOpen(false)} className="rounded-xl border border-[var(--border)] p-2 text-[var(--text)]"><X size={16} /></button>
            </div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--muted)]" htmlFor="theme-name">Name</label>
            <input id="theme-name" value={draftName} onChange={(event) => setDraftName(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-3 text-sm text-[var(--text)]" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Paper<input type="color" value={draftPaper} onChange={(event) => setDraftPaper(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-transparent" /></label>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Text<input type="color" value={draftInk} onChange={(event) => setDraftInk(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-transparent" /></label>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Headings<input type="color" value={draftAccent} onChange={(event) => setDraftAccent(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-transparent" /></label>
            </div>
            <div className="mt-4">
              <ResumeSample theme={{ id: 'draft', name: draftName, description: '', paper: draftPaper, ink: draftInk, accent: draftAccent, premium: false }} name={sampleName} role={sampleRole} lines={sampleLines} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="submit">Save and use this theme</Button>
              <Button type="button" variant="secondary" onClick={() => setRequestOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
